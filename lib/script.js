var bcoin = require('../')
var constants = bcoin.constants('mainnet')
var elliptic = require('elliptic')
var ecdsa = elliptic.ec(elliptic.curves.secp256k1)
var utils = bcoin.utils

var script = module.exports

script.decode = function decode(s) {
    if (!s) return [];
    if (Buffer.isBuffer(s))
      s = utils.toArray(s)
    var opcodes = [];
    for (var i = 0; i < s.length;) {
        var b = s[i++];

        // Next `b` bytes should be pushed to stack
        if (b >= 0x01 && b <= 0x4b) {
            opcodes.push(s.slice(i, i + b));
            i += b;
            continue;
        }

        // Zero
        if (b === 0) {
            opcodes.push([]);
            continue;
        }

        // Raw number
        if (b >= 0x51 && b <= 0x60) {
            opcodes.push(b - 0x50);
            continue;
        }

        var opcode = constants.opcodesByVal[b];
        if (opcode === 'OP_PUSHDATA1') {
            var len = s[i++];
            opcodes.push(s.slice(i, i + len));
            i += 2 + len;
        } else if (opcode === 'OP_PUSHDATA2') {
            var len = utils.readU16(s, i);
            i += 2;
            opcodes.push(s.slice(i, i + len));
            i += len;
        } else if (opcode === 'OP_PUSHDATA4') {
            var len = utils.readU32(s, i);
            i += 4;
            opcodes.push(s.slice(i, i + len));
            i += len;
        } else {
            opcodes.push(opcode || b);
        }
    }
    return opcodes;
};

script.encode = function encode(s) {
    if (!s) return [];
    if (Buffer.isBuffer(s))
      s = utils.toArray(s)
    var opcodes = constants.opcodes;
    var res = [];
    for (var i = 0; i < s.length; i++) {
        var instr = s[i];

        // Push value to stack
        if (Array.isArray(instr)) {
            if (instr.length === 0) {
                res.push(0);
            } else if (1 <= instr.length && instr.length <= 0x4b) {
                res = res.concat(instr.length, instr);
            } else if (instr.length <= 0xff) {
                res = res.concat(opcodes.OP_PUSHDATA1, instr.length, instr);
            } else if (instr.length <= 0xffff) {
                res.push(opcodes.OP_PUSHDATA2);
                utils.writeU16(res, instr.length, res.length);
                res = res.concat(instr);
            } else {
                res.push(opcodes.OP_PUSHDATA4);
                utils.writeU32(res, instr.length, res.length);
                res = res.concat(instr);
            }
            continue;
        }

        res.push(opcodes[instr] || instr);
    }

    return res;
};

script.subscript = function subscript(s) {
    if (!s) return [];

    var lastSep = -1;
    for (var i = 0; i < s.length; i++) {
        if (s[i] === 'OP_CODESEPARATOR') lastSep = i;
        else if (s[i] === 'OP_CHECKSIG' || s[i] === 'OP_CHECKSIGVERIFY' || s[i] === 'OP_CHECKMULTISIG' || s[i] === 'OP_CHECKMULTISIGVERIFY') {
            break;
        }
    }

    var res = [];
    for (var i = lastSep + 1; i < s.length; i++)
    if (s[i] !== 'OP_CODESEPARATOR') res.push(s[i]);

    return res;
};

script.execute = function execute(s, stack, tx) {
    for (var pc = 0; pc < s.length; pc++) {
        var o = s[pc];
        if (Array.isArray(o)) {
            stack.push(o);
        } else if (o === 'OP_DUP') {
            if (stack.length === 0) return false;

            stack.push(stack[stack.length - 1]);
        } else if (o === 'OP_HASH160') {
            if (stack.length === 0) return false;

            stack.push(utils.ripesha(stack.pop()));
        } else if (o === 'OP_EQUALVERIFY' || o === 'OP_EQUAL') {
            if (stack.length < 2) return false;

            var res = utils.isEqual(stack.pop(), stack.pop());
            if (o === 'OP_EQUALVERIFY') {
                if (!res) return false;
            } else {
                stack.push(res ? [1] : []);
            }

        } else if (o === 'OP_CHECKSIGVERIFY' || o === 'OP_CHECKSIG') {
            if (!tx || stack.length < 2) return false;

            var pub = stack.pop();
            var sig = stack.pop();
            var type = sig[sig.length - 1];
            if (type !== 1) return false;

            var res = ecdsa.verify(tx, sig.slice(0, - 1), pub);
            if (o === 'OP_CHECKSIGVERIFY') {
                if (!res) return false;
            } else {
                stack.push(res ? [1] : []);
            }
        } else if (o === 'OP_CHECKMULTISIGVERIFY' || o === 'OP_CHECKMULTISIG') {
            if (!tx || stack.length < 3) return false;

            var n = stack.pop();
            if (n.length !== 1 || !(1 <= n[0] && n[0] <= 3)) return false;
            n = n[0];

            if (stack.length < n + 1) return false;

            var keys = [];
            for (var i = 0; i < n; i++) {
                var key = stack.pop();
                if (!(33 <= key.length && key.length <= 65)) return false;

                keys.push(key);
            }

            var m = stack.pop();
            if (m.length !== 1 || !(1 <= m[0] && m[0] <= n)) return false;
            m = m[0];

            if (stack.length < m + 1) return false;

            // Get signatures
            var succ = 0;
            for (var i = 0, j = 0; i < m && j < n; i++) {
                var sig = stack.pop();
                var type = sig[sig.length - 1];
                if (type !== 1) return false;

                var res = false;
                for (; !res && j < n; j++)
                res = ecdsa.verify(tx, sig.slice(0, - 1), keys[j]);
                if (res) succ++;
            }

            // Extra value
            stack.pop();

            var res = succ >= m;
            if (o === 'OP_CHECKMULTISIGVERIFY') {
                if (!res) return false;
            } else {
                stack.push(res ? [1] : []);
            }
        } else {
            // Unknown operation
            return false;
        }
    }

    return true;
};

script.isSimplePubkeyhash = function isSimplePubkeyhash (s, hash) {
    if (s.length !== 2) return false;

    var match = Array.isArray(s[0]) && s[1] === 'OP_CHECKSIG';
    if (!match) return false;

    if (hash) return utils.isEqual(s[0], hash);
    else return s[0];
};

script.isPubkeyhashIn = function isPubkeyhashIn (s) {
    if (s.length !== 2) return false;

    return 9 <= s[0].length && s[0].length <= 73 && 33 <= s[1].length && s[1].length <= 65;
};

script.isPubkeyhash = function isPubkeyhash(s, hash) {
    if (s.length !== 5) return false;

    var match = s[0] === 'OP_DUP'
             && s[1] === 'OP_HASH160'
             && Array.isArray(s[2])
             && s[3] === 'OP_EQUALVERIFY'
             && s[4] === 'OP_CHECKSIG';
    if (!match) return false;

    if (hash) return utils.isEqual(s[2], hash);
    else return s[2];
};

script.isScripthash = function isScripthash (s) {
  if (s.length != 3) return false;

  return s[0] === 'OP_HASH160'
      && Array.isArray(s[1])
      && s[1].length === 20
      && s[2] === 'OP_EQUAL'
}

script.isMultisig = function isMultisig(s) {
    if (s.length < 4) return false;

    var m = s[0];
    if (!(typeof m === 'number')) return false;

    if (s[s.length - 1] !== 'OP_CHECKMULTISIG') return false;

    var n = s[s.length - 2];
    if (!(typeof n === 'number')) return false;

    if (n + 3 !== s.length) return false;

    var keys = s.slice(1, 1 + n);
    var isArray = keys.every(function(k) {
        return Array.isArray(k);
    });
    if (!isArray) return false;

    return { m: m, n: n, keys: keys };
};

// remove this once input types are correct in the database
// as this is buggy
script.isScripthashIn = function isScripthashIn(s) {
  s = script.decode(s[s.length - 1])
  return script.isMultisig(s)
}

script.isNullData = function isNullData(s) {
  if (s.length !== 2)
    return false;

  return s[0] === 'OP_RETURN'
       && Array.isArray(s[1])
       && s[1].length <= 40;
};

script.getOutputType = function getOutputType (s) {
  s = bcoin.script.decode(s)
  if (Array.isArray(bcoin.script.isPubkeyhash(s))) {
    return 'pubkeyhash'
  } else if (Array.isArray(bcoin.script.isSimplePubkeyhash(s))) {
    return 'pubkey'
  } else if (bcoin.script.isScripthash(s)) {
    return 'scripthash'
  } else if (bcoin.script.isNullData(s)) {
    return 'nulldata'
  }
}

// this function is too complicated and should be deprecated
script.getAddresses = function getAddresses (s, network) {
  s = script.decode(s)
  if (Array.isArray(bcoin.script.isPubkeyhash(s))) {
    return [utils.hash2addr(s[2], network)]
  }
  else if (Array.isArray(bcoin.script.isSimplePubkeyhash(s))) {
    return [utils.hash2addr(utils.ripesha(s[0]), network)]
  }
  else if (script.isPubkeyhashIn(s)) {
    return [utils.hash2addr(utils.ripesha(s[1]), network)]
  }
  else if (script.isScripthash(s)) {
    return [utils.hash2scriptaddr(s[1], network)]
  }
  else if (script.isMultisig(s)) {
    var m = s[0];
    var n = s[s.length - 2];
    var keys = s.slice(1, 1 + n);
    return keys.map(function (k) {
      return utils.hash2addr(utils.ripesha(k), network)
    })
  }
  else if (script.isScripthashIn(s)) {
    return [utils.hash2scriptaddr(utils.ripesha(s[s.length - 1]), network)]
  }
}
