var extend = require('xtend')

module.exports = function (network) {
  return extend(constants, networks[network])
}

var constants = {}

var networks = {
  mainnet: {
    magic: 0xd9b4bef9,
    port: 8333,
    rpc: 8332,
    wif: {
      pub: 0x00,
      prv: 0x80,
      scripthash: 0x05
    }
  },
  testnet3: {
    magic: 0x0709110b,
    port: 18333,
    rpc: 18332,
    wif: {
      pub: 0x6f,
      prv: 0x6e,
      scripthash: 0xc4
    }
  }
}

constants.block = {
  maxSize: 1000000,
  maxSigops: 1000000 / 50,
  maxOrphanTx: 1000000 / 100
}

constants.minVersion = 70001
constants.version = 70002

constants.inv = {
    error: 0,
    tx: 1,
    block: 2,
    filtered: 3
}

constants.invByVal = {
    0: 'error',
    1: 'tx',
    2: 'block',
    3: 'filtered'
}

// version - services field
constants.services = {
  network: 1
}

// Little-endian hash type
constants.hashType = {
    all: 1,
    none: 2,
    single: 3,
    anyonecaypay: 0x80
}

constants.opcodes = {
  OP_0: 0,
  OP_PUSHDATA1: 0x4c,
  OP_PUSHDATA2: 0x4d,
  OP_PUSHDATA4: 0x4e,
  OP_1NEGATE: 0x4f,

  OP_NOP: 0x61,
  OP_IF: 0x63,
  OP_NOTIF: 0x64,
  OP_ELSE: 0x67,
  OP_ENDIF: 0x68,
  OP_VERIFY: 0x69,
  OP_RETURN: 0x6a,

  OP_TOALTSTACK: 0x6b,
  OP_FROMALTSTACK: 0x6c,
  OP_IFDUP: 0x73,
  OP_DEPTH: 0x74,
  OP_DROP: 0x75,
  OP_DUP: 0x76,
  OP_NIP: 0x77,
  OP_OVER: 0x78,
  OP_PICK: 0x79,
  OP_ROLL: 0x7a,
  OP_ROT: 0x7b,
  OP_SWAP: 0x7c,
  OP_TUCK: 0x7d,
  OP_2DROP: 0x6d,
  OP_2DUP: 0x6e,
  OP_3DUP: 0x6f,
  OP_2OVER: 0x70,
  OP_2ROT: 0x71,
  OP_2SWAP: 0x72,

  OP_CAT: 0x7e,
  OP_SUBSTR: 0x7f,
  OP_LEFT: 0x80,
  OP_RIGHT: 0x81,
  OP_SIZE: 0x82,

  OP_INVERT: 0x83,
  OP_AND: 0x84,
  OP_OR: 0x85,
  OP_XOR: 0x86,
  OP_EQUAL: 0x87,
  OP_EQUALVERIFY: 0x88,

  OP_1ADD: 0x8b,
  OP_1SUB: 0x8c,
  OP_2MUL: 0x8d,
  OP_2DIV: 0x8e,
  OP_NEGATE: 0x8f,
  OP_ABS: 0x90,
  OP_NOT: 0x91,
  OP_0NOTEQUAL: 0x92,
  OP_ADD: 0x93,
  OP_SUB: 0x94,
  OP_MUL: 0x95,
  OP_DIV: 0x96,
  OP_MOD: 0x97,
  OP_LSHIFT: 0x98,
  OP_RSHIFT: 0x99,
  OP_BOOLAND: 0x9a,
  OP_BOOLOR: 0x9b,
  OP_NUMEQUAL: 0x9c,
  OP_NUMEQUALVERIFY: 0x9d,
  OP_NUMNOTEQUAL: 0x9e,
  OP_LESSTHAN: 0x9f,
  OP_GREATERTHAN: 0xa0,
  OP_LESSTHANOREQUAL: 0xa1,
  OP_GREATERTHANOREQUAL: 0xa2,
  OP_MIN: 0xa3,
  OP_MAX: 0xa4,
  OP_WITHIN: 0xa5,

  OP_RIPEMD160: 0xa6,
  OP_SHA1: 0xa7,
  OP_SHA256: 0xa8,
  OP_HASH160: 0xa9,
  OP_HASH256: 0xaa,
  OP_CODESEPARATOR: 0xab,
  OP_CHECKSIG: 0xac,
  OP_CHECKSIGVERIFY: 0xad,
  OP_CHECKMULTISIG: 0xae,
  OP_CHECKMULTISIGVERIFY: 0xaf,

  OP_PUBKEYHASH: 0xfd,
  OP_PUBKEY: 0xfe,
  OP_INVALIDOPCODE: 0xff,

  OP_RESERVED: 0x50,
  OP_VER: 0x62,
  OP_VERIF: 0x64,
  OP_VERNOTIF: 0x66,
  OP_RESERVED1: 0x89,
  OP_RESERVED2: 0x8a
}

for (var i = 1; i <= 16; i++) {
  constants.opcodes[i] = 0x50 + i
}

constants.opcodesByVal = new Array(256);
Object.keys(constants.opcodes).forEach(function(name) {
  constants.opcodesByVal[constants.opcodes[name]] = name;
});
