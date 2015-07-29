var assert = require('assert');
var bcoin = require('../')
var utils = bcoin.utils

describe('Script', function() {
  it('should encode/decode script', function() {
      var src = '20' + '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f' + '20' + '101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f' + 'ac';

      var decoded = bcoin.script.decode(utils.toArray(src, 'hex'));
      assert.equal(decoded.length, 3);
      assert.equal(
      utils.toHex(decoded[0]), '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f');
      assert.equal(
      utils.toHex(decoded[1]), '101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f');
      assert.equal(decoded[2], 'OP_CHECKSIG');

      var dst = bcoin.script.encode(decoded);
      assert.equal(utils.toHex(dst), src);
  });

  it('should encode/decode numbers', function() {
      var testscript = [
          [],
          1,
          2,
          16
      ];
      var encoded = bcoin.script.encode(testscript);
      assert.deepEqual(encoded, [0, 0x51, 0x52, 0x60]);
      var decoded = bcoin.script.decode(encoded);
      assert.deepEqual(decoded, testscript);
  });

  it('should decode this fucking tx', function () {
    var encoded = [ 4, 255, 255, 0, 29, 1, 4, 69, 84, 104, 101, 32, 84, 105, 109, 101, 115, 32, 48, 51, 47, 74, 97, 110, 47, 50, 48, 48, 57, 32, 67, 104, 97, 110, 99, 101, 108, 108, 111, 114, 32, 111, 110, 32, 98, 114, 105, 110, 107, 32, 111, 102, 32, 115, 101, 99, 111, 110, 100, 32, 98, 97, 105, 108, 111, 117, 116, 32, 102, 111, 114, 32, 98, 97, 110, 107, 115, 255, 255, 255, 255, 1, 0, 242, 5, 42, 1, 0, 0, 0, 67, 65, 4, 103, 138, 253, 176, 254, 85, 72, 39, 25, 103, 241, 166, 113, 48, 183, 16, 92, 214, 168, 40, 224, 57, 9, 166, 121, 98, 224, 234, 31, 97, 222, 182, 73, 246, 188, 63, 76, 239, 56, 196, 243, 85, 4, 229, 30, 193, 18, 222, 92, 56, 77, 247, 186, 11, 141, 87, 138, 76, 112, 43, 107, 241, 29, 95, 172, 0, 0, 0, 0 ]
    var decoded = bcoin.script.decode(encoded);
    assert.deepEqual(bcoin.script.encode(decoded), encoded)
  })

  describe('Scripts', function () {
    it('should recognize a P2PKH output', function () {
      var hex = '76a914edbdd23480fbe8d11fdbf615147724d4da29fa7d88ac'
      var encoded = utils.toArray(hex, 'hex')
      var decoded = bcoin.script.decode(encoded);
      assert(bcoin.script.isPubkeyhash(decoded))
    })

    it('should recognize a P2PKH input', function () {
      var hex = '483045022100bfe39eb80fd140f42c5c25fdcbf7111b5c3630c13822356bb6439636f9edd6190220095b4acf1ea7c6379715a1303071c0c7841a1ce44f70fd082e2791adeb7d257a0121035194b2d149d80442f9611cf7bc7207c2e872180b5df6a8cb8281f4afae5caaae'
      var encoded = utils.toArray(hex, 'hex')
      var decoded = bcoin.script.decode(encoded);
      assert(bcoin.script.isPubkeyhashIn(decoded))
    })

    it('should recognize a Multisig output', function () {
      var hex = '5121033e81519ecf373ea3a5c7e1c051b71a898fb3438c9550e274d980f147eb4d069d2103fe4e6231d614d159741df8371fa3b31ab93b3d28a7495cdaa0cd63a2097015c752ae'
      var encoded = utils.toArray(hex, 'hex')
      var decoded = bcoin.script.decode(encoded);
      var parsed = bcoin.script.isMultisig(decoded);
      assert(parsed)
      assert.equal(parsed.m, 1)
      assert.equal(parsed.n, 2)
      assert.equal(parsed.keys.length, 2)
    })

    it('should recognize a P2SH output', function () {
      var hex = 'a91419a7d869032368fd1f1e26e5e73a4ad0e474960e87'
      var encoded = utils.toArray(hex, 'hex')
      var decoded = bcoin.script.decode(encoded);
      assert(bcoin.script.isScripthash(decoded))
    })

    it('should recognize a Null Data output', function () {
      var hex = '6a28590c080112220a1b353930632e6f7267282a5f5e294f7665726c6179404f7261636c65103b1a010c'
      var encoded = utils.toArray(hex, 'hex')
      var decoded = bcoin.script.decode(encoded);
      assert(bcoin.script.isNullData(decoded))
    })

    it('should return the correct output type', function () {
      var pubkeyhash = utils.toArray('76a914edbdd23480fbe8d11fdbf615147724d4da29fa7d88ac', 'hex')
      assert.equal(bcoin.script.getOutputType(pubkeyhash), 'pubkeyhash')

      var multisig = utils.toArray('5121033e81519ecf373ea3a5c7e1c051b71a898fb3438c9550e274d980f147eb4d069d2103fe4e6231d614d159741df8371fa3b31ab93b3d28a7495cdaa0cd63a2097015c752ae', 'hex')
      assert.equal(bcoin.script.getOutputType(multisig), 'multisig1of2')

      var pubkey = utils.toArray('4104ae1a62fe09c5f51b13905f07f06b99a2f7159b2225f374cd378d71302fa28414e7aab37397f554a7df5f142c21c1b7303b8a0626f1baded5c72a704f7e6cd84cac', 'hex')
      assert.equal(bcoin.script.getOutputType(pubkey), 'pubkey')

      var scripthash = utils.toArray('a9143e71b020e16a160f2fe9e17421800317ceddb8db87', 'hex')
      assert.equal(bcoin.script.getOutputType(scripthash), 'scripthash')

      var nulldata = utils.toArray('6a28590c080112220a1b353930632e6f7267282a5f5e294f7665726c6179404f7261636c65103b1a010c', 'hex')
      assert.equal(bcoin.script.getOutputType(nulldata), 'nulldata')
    })
  })

  describe('Address', function () {
    it('should get an address from a P2PKH output script', function () {
      var hex = '76a914edbdd23480fbe8d11fdbf615147724d4da29fa7d88ac'
      var encoded = utils.toArray(hex, 'hex')
      assert.equal(bcoin.script.getAddresses(encoded, 'mainnet')[0], '1Ng4YU2e2H3E86syX2qrsmD9opBHZ42vCF')
    })

    it('should get an address from a P2PKH input script', function () {
      var hex = '493046022100bb3c194a30e460d81d34be0a230179c043a656f67e3c5c8bf47eceae7c4042ee0221008bf54ca11b2985285be0fd7a212873d243e6e73f5fad57e8eb14c4f39728b8c6014104e365859b3c78a8b7c202412b949ebca58e147dba297be29eee53cd3e1d300a6419bc780cc9aec0dc94ed194e91c8f6433f1b781ee00eac0ead2aae1e8e0712c6'
      var encoded = utils.toArray(hex, 'hex')
      assert.equal(bcoin.script.getAddresses(encoded, 'mainnet')[0], '127k9DmeZa7JAwxG2TPHTTMbnwP181vNYb');
    })

    it('should get the addresses of a Multisig output', function () {
      var hex = '5121033e81519ecf373ea3a5c7e1c051b71a898fb3438c9550e274d980f147eb4d069d2103fe4e6231d614d159741df8371fa3b31ab93b3d28a7495cdaa0cd63a2097015c752ae'
      var encoded = utils.toArray(hex, 'hex')
      assert.deepEqual(bcoin.script.getAddresses(encoded, 'mainnet'), [ '1JXc8zsSeAPwqfAzLbBnZxNTfetZexH2bW', '14XufxyGiY6ZBJsFYHJm6awdzpJdtsP1i3' ])
    })

    it('should get an address from a P2PK output script', function () {
      var hex = '4104ae1a62fe09c5f51b13905f07f06b99a2f7159b2225f374cd378d71302fa28414e7aab37397f554a7df5f142c21c1b7303b8a0626f1baded5c72a704f7e6cd84cac'
      var encoded = utils.toArray(hex, 'hex')
      assert.equal(bcoin.script.getAddresses(encoded, 'mainnet')[0], '1Q2TWHE3GMdB6BZKafqwxXtWAWgFt5Jvm3')
    })

    it('should get an address from a P2SH output script', function () {
      var hex = 'a9143e71b020e16a160f2fe9e17421800317ceddb8db87'
      var encoded = utils.toArray(hex, 'hex')
      assert.equal(bcoin.script.getAddresses(encoded, 'testnet3')[0], '2MxwQ5MjWJTqecb2nnawMH9eX6cjnb3HgND')
    })

    it('should get an address from a P2SH input script', function () {
      var hex = '0047304402206cced6ca496b77a07a2165ebcc317b2ddf0ec9da06b904b45950ef6ef9b8bd1a0220661a7e7bb5dd3026fc04eb56fb8cd763bc3641bf68ec200f989e2ba931f5e605014830450221008716b43c8ce99405872b3e880d1360537b6b94be379330b2e465a03f9a39f2c7022009ade368e3e4c63cd6a86c55cd3132a6734cf379f78ef944f28b97d62e2e7c5c014c69522103cce1be5634b7ec9790190842de4520ff6c2cea47179e7e9156be97ecd243a7d221024242188a92825c68e40ae5cb6a7d3794b8c3cb67ea8abfdd8a177c778f3dd98d21036bb2981d405883d432ad74742c1aecc24a858b4639bedf2c3f15f3512ddd091753ae'
      var encoded = utils.toArray(hex, 'hex')
      assert.equal(bcoin.script.getAddresses(encoded, 'mainnet')[0], '3Nw96PpfFoiM863pEvWXyKpee9TFdCEV5G')
    })
  })

});
