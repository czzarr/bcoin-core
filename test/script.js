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

  describe('Non-Standard Scripts', function () {
    it('should decode this script', function () {
      var encoded = [ 4, 255, 255, 0, 29, 1, 4, 69, 84, 104, 101, 32, 84, 105, 109, 101, 115, 32, 48, 51, 47, 74, 97, 110, 47, 50, 48, 48, 57, 32, 67, 104, 97, 110, 99, 101, 108, 108, 111, 114, 32, 111, 110, 32, 98, 114, 105, 110, 107, 32, 111, 102, 32, 115, 101, 99, 111, 110, 100, 32, 98, 97, 105, 108, 111, 117, 116, 32, 102, 111, 114, 32, 98, 97, 110, 107, 115, 255, 255, 255, 255, 1, 0, 242, 5, 42, 1, 0, 0, 0, 67, 65, 4, 103, 138, 253, 176, 254, 85, 72, 39, 25, 103, 241, 166, 113, 48, 183, 16, 92, 214, 168, 40, 224, 57, 9, 166, 121, 98, 224, 234, 31, 97, 222, 182, 73, 246, 188, 63, 76, 239, 56, 196, 243, 85, 4, 229, 30, 193, 18, 222, 92, 56, 77, 247, 186, 11, 141, 87, 138, 76, 112, 43, 107, 241, 29, 95, 172, 0, 0, 0, 0 ]
      var decoded = bcoin.script.decode(encoded);
      assert.deepEqual(bcoin.script.encode(decoded), encoded)
    })
  })

  describe('Standard Scripts', function () {
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

  describe('AddressesByType', function () {
    it('should get an address from a P2PKH output script', function () {
      var hex = '76a914edbdd23480fbe8d11fdbf615147724d4da29fa7d88ac'
      var encoded = utils.toArray(hex, 'hex')
      var decoded = bcoin.script.decode(encoded);
      assert.equal(bcoin.script.getAddressesByType(decoded, { type: 'pubkeyhash', is_output: true, network: 'mainnet' })[0], '1Ng4YU2e2H3E86syX2qrsmD9opBHZ42vCF')
    })

    it('should get an address from a P2PKH input script', function () {
      var hex = '493046022100bb3c194a30e460d81d34be0a230179c043a656f67e3c5c8bf47eceae7c4042ee0221008bf54ca11b2985285be0fd7a212873d243e6e73f5fad57e8eb14c4f39728b8c6014104e365859b3c78a8b7c202412b949ebca58e147dba297be29eee53cd3e1d300a6419bc780cc9aec0dc94ed194e91c8f6433f1b781ee00eac0ead2aae1e8e0712c6'
      var encoded = utils.toArray(hex, 'hex')
      var decoded = bcoin.script.decode(encoded);
      assert.equal(bcoin.script.getAddressesByType(decoded, { type: 'pubkeyhash', is_output: false, network: 'mainnet' })[0], '127k9DmeZa7JAwxG2TPHTTMbnwP181vNYb');
    })

    it('should get the addresses of a Multisig output script', function () {
      var hex = '5121033e81519ecf373ea3a5c7e1c051b71a898fb3438c9550e274d980f147eb4d069d2103fe4e6231d614d159741df8371fa3b31ab93b3d28a7495cdaa0cd63a2097015c752ae'
      var encoded = utils.toArray(hex, 'hex')
      var decoded = bcoin.script.decode(encoded);
      assert.deepEqual(bcoin.script.getAddressesByType(decoded, { type: 'multisig1of2', is_output: true, network: 'mainnet' }), [ '1JXc8zsSeAPwqfAzLbBnZxNTfetZexH2bW', '14XufxyGiY6ZBJsFYHJm6awdzpJdtsP1i3' ])
    })

    it('should get an address from a P2PK output script', function () {
      var hex = '4104ae1a62fe09c5f51b13905f07f06b99a2f7159b2225f374cd378d71302fa28414e7aab37397f554a7df5f142c21c1b7303b8a0626f1baded5c72a704f7e6cd84cac'
      var encoded = utils.toArray(hex, 'hex')
      var decoded = bcoin.script.decode(encoded);
      assert.equal(bcoin.script.getAddressesByType(decoded, { type: 'pubkey', is_output: true, network: 'mainnet' })[0], '1Q2TWHE3GMdB6BZKafqwxXtWAWgFt5Jvm3')
    })

    it('should get an address from a P2SH output script', function () {
      var hex = 'a914297c7fedc24ee78974b27a475c2e1522828b0a1087'
      var encoded = utils.toArray(hex, 'hex')
      var decoded = bcoin.script.decode(encoded);
      assert.equal(bcoin.script.getAddressesByType(decoded, { type: 'scripthash', is_output: true, network: 'mainnet' })[0], '35UNmoRCafgXSpNL7y5U19GK67sbquPysA')
    })

    it('should get an address from a P2SH input script', function () {
      var hex = '0047304402206cced6ca496b77a07a2165ebcc317b2ddf0ec9da06b904b45950ef6ef9b8bd1a0220661a7e7bb5dd3026fc04eb56fb8cd763bc3641bf68ec200f989e2ba931f5e605014830450221008716b43c8ce99405872b3e880d1360537b6b94be379330b2e465a03f9a39f2c7022009ade368e3e4c63cd6a86c55cd3132a6734cf379f78ef944f28b97d62e2e7c5c014c69522103cce1be5634b7ec9790190842de4520ff6c2cea47179e7e9156be97ecd243a7d221024242188a92825c68e40ae5cb6a7d3794b8c3cb67ea8abfdd8a177c778f3dd98d21036bb2981d405883d432ad74742c1aecc24a858b4639bedf2c3f15f3512ddd091753ae'
      var encoded = utils.toArray(hex, 'hex')
      var decoded = bcoin.script.decode(encoded);
      assert.equal(bcoin.script.getAddressesByType(decoded, { type: 'scripthash', is_output: false, network: 'mainnet' })[0], '3Nw96PpfFoiM863pEvWXyKpee9TFdCEV5G')
    })
  })

  describe('Get readable scripts', function () {
    it('should get a readable pubkey output script', function () {
      var hex = '2103d68f90ba81455256cb7a0df14fb3930d6df61393207f2f3e71659414d296e0f0ac'
      var encoded = utils.toArray(hex, 'hex')
      var decoded = bcoin.script.decode(encoded);
      assert.equal(bcoin.script.getReadableScript(decoded, { type: 'pubkey', is_output: true, network: 'mainnet' }), '03d68f90ba81455256cb7a0df14fb3930d6df61393207f2f3e71659414d296e0f0 OP_CHECKSIG')
    })
    it('should get a readable pubkey input script which is just a sig', function () {
      var hex = '47304402207e41f15bd61d41160e229b9e95a5e54db4f1b19f30cb1e613a6ac11e10e8f78b02203929356876ea16a5837290391a8fa40c3bb7c393f118633e2cebe38ab175613201'
      var encoded = utils.toArray(hex, 'hex')
      var decoded = bcoin.script.decode(encoded);
      assert.equal(bcoin.script.getReadableScript(decoded, { type: 'pubkey', is_output: false, network: 'mainnet' }), '304402207e41f15bd61d41160e229b9e95a5e54db4f1b19f30cb1e613a6ac11e10e8f78b02203929356876ea16a5837290391a8fa40c3bb7c393f118633e2cebe38ab175613201')
    })
    it('should get a readable pubkeyhash output script', function () {
      var hex = '76a9147c691afeb3e8c895681eadb5bef3372d1669683a88ac'
      var encoded = utils.toArray(hex, 'hex')
      var decoded = bcoin.script.decode(encoded);
      assert.equal(bcoin.script.getReadableScript(decoded, { type: 'pubkeyhash', is_output: true, network: 'mainnet' }), 'OP_DUP OP_HASH160 7c691afeb3e8c895681eadb5bef3372d1669683a OP_EQUALVERIFY OP_CHECKSIG')
    })
    it('should get a readable pubkeyhash input script which is just a sig and a public key', function () {
      var hex = '483045022100e1e2e12e93d1beb3a0cf9f41310eef67bff28c793b747806144121db06acc4140220647e60db1e90965a94046bba63b84ffb38aa91a8b4b15edefbb38cf717d43abf012103fdf80176d061b65ba551305d788790c6433e67817aa2490151752eba9d25c19c'
      var encoded = utils.toArray(hex, 'hex')
      var decoded = bcoin.script.decode(encoded);
      assert.equal(bcoin.script.getReadableScript(decoded, { type: 'pubkeyhash', is_output: false, network: 'mainnet' }), '3045022100e1e2e12e93d1beb3a0cf9f41310eef67bff28c793b747806144121db06acc4140220647e60db1e90965a94046bba63b84ffb38aa91a8b4b15edefbb38cf717d43abf01 03fdf80176d061b65ba551305d788790c6433e67817aa2490151752eba9d25c19c')
    })
    it('should get a readable scripthash output script', function () {
      var hex = 'a914297c7fedc24ee78974b27a475c2e1522828b0a1087'
      var encoded = utils.toArray(hex, 'hex')
      var decoded = bcoin.script.decode(encoded);
      assert.equal(bcoin.script.getReadableScript(decoded, { type: 'scripthash', is_output: true, network: 'mainnet' }), 'OP_HASH160 297c7fedc24ee78974b27a475c2e1522828b0a10 OP_EQUAL')
    })
    it('should get a readable scripthash input script which is just 0, some sigs and a redeem script', function () {
      var hex = '0047304402206cced6ca496b77a07a2165ebcc317b2ddf0ec9da06b904b45950ef6ef9b8bd1a0220661a7e7bb5dd3026fc04eb56fb8cd763bc3641bf68ec200f989e2ba931f5e605014830450221008716b43c8ce99405872b3e880d1360537b6b94be379330b2e465a03f9a39f2c7022009ade368e3e4c63cd6a86c55cd3132a6734cf379f78ef944f28b97d62e2e7c5c014c69522103cce1be5634b7ec9790190842de4520ff6c2cea47179e7e9156be97ecd243a7d221024242188a92825c68e40ae5cb6a7d3794b8c3cb67ea8abfdd8a177c778f3dd98d21036bb2981d405883d432ad74742c1aecc24a858b4639bedf2c3f15f3512ddd091753ae'
      var encoded = utils.toArray(hex, 'hex')
      var decoded = bcoin.script.decode(encoded);
      assert.equal(bcoin.script.getReadableScript(decoded, { type: 'scripthash', is_output: false, network: 'mainnet' }), '0 304402206cced6ca496b77a07a2165ebcc317b2ddf0ec9da06b904b45950ef6ef9b8bd1a0220661a7e7bb5dd3026fc04eb56fb8cd763bc3641bf68ec200f989e2ba931f5e60501 30450221008716b43c8ce99405872b3e880d1360537b6b94be379330b2e465a03f9a39f2c7022009ade368e3e4c63cd6a86c55cd3132a6734cf379f78ef944f28b97d62e2e7c5c01 522103cce1be5634b7ec9790190842de4520ff6c2cea47179e7e9156be97ecd243a7d221024242188a92825c68e40ae5cb6a7d3794b8c3cb67ea8abfdd8a177c778f3dd98d21036bb2981d405883d432ad74742c1aecc24a858b4639bedf2c3f15f3512ddd091753ae')
    })
    it('should get a readable multisig output script', function () {
      var hex = '522102c08786d63f78bd0a6777ffe9c978cf5899756cfc32bfad09a89e211aeb926242210209655ca6743d5dfe2facf533a23189fdd3c3d872ca5423127b060b9a2e7c690f21029ca7b8445a9f2f189ea59ef28eb13dac2ac8a43916a25c80c0f01ad1f2a33a9553ae'
      var encoded = utils.toArray(hex, 'hex')
      var decoded = bcoin.script.decode(encoded);
      assert.equal(bcoin.script.getReadableScript(decoded, { type: 'multisig', is_output: true, network: 'mainnet' }), '2 02c08786d63f78bd0a6777ffe9c978cf5899756cfc32bfad09a89e211aeb926242 0209655ca6743d5dfe2facf533a23189fdd3c3d872ca5423127b060b9a2e7c690f 029ca7b8445a9f2f189ea59ef28eb13dac2ac8a43916a25c80c0f01ad1f2a33a95 3 OP_CHECKMULTISIG')
    })
    it('should get a readable multisig input script which is just 0 and some sigs', function () {
      var hex = '0047304402203df44d9c876f7720edd5fee125f90398e1d9a86f87b39c3d75042e5588be53a902207baea45de0697e84ee93f6ff72f15a4ca15f49cad11cf1bf320ab2dff0e5a69c01'
      var encoded = utils.toArray(hex, 'hex')
      var decoded = bcoin.script.decode(encoded);
      assert.equal(bcoin.script.getReadableScript(decoded, { type: 'multisig', is_output: false, network: 'mainnet' }), '0 304402203df44d9c876f7720edd5fee125f90398e1d9a86f87b39c3d75042e5588be53a902207baea45de0697e84ee93f6ff72f15a4ca15f49cad11cf1bf320ab2dff0e5a69c01')
    })
    it('should get a readable nulldata output script', function () {
      var hex = '6a1cd7801a2fd926c800c36e55c3bc81a5d169ad9ce5d63f958a4b97b17d'
      var encoded = utils.toArray(hex, 'hex')
      var decoded = bcoin.script.decode(encoded);
      assert.equal(bcoin.script.getReadableScript(decoded, { type: 'nulldata', is_output: true, network: 'mainnet' }), 'OP_RETURN d7801a2fd926c800c36e55c3bc81a5d169ad9ce5d63f958a4b97b17d')
    })
    it('should get a readable non standard script', function () {
      var hex = 'aa206fe28c0ab6f1b372c1a6a246ae63f74f931e8365e15a089c68d619000000000087'
      var encoded = utils.toArray(hex, 'hex')
      var decoded = bcoin.script.decode(encoded);
      assert.equal(bcoin.script.getReadableScript(decoded, {}), 'OP_HASH256 6fe28c0ab6f1b372c1a6a246ae63f74f931e8365e15a089c68d6190000000000 OP_EQUAL')
    })
    it('should get a readable non standard script', function () {
      var hex = '51'
      var encoded = utils.toArray(hex, 'hex')
      var decoded = bcoin.script.decode(encoded);
      assert.equal(bcoin.script.getReadableScript(decoded, {}), '1')
    })
    it('should get a readable non standard script', function () {
      var hex = '6a'
      var encoded = utils.toArray(hex, 'hex')
      var decoded = bcoin.script.decode(encoded);
      assert.equal(bcoin.script.getReadableScript(decoded, {}), 'OP_RETURN')
    })
    it('should get a readable non standard script hash', function () {
      var hex = '510b04e7f16656b17551935287'
      var encoded = utils.toArray(hex, 'hex')
      var decoded = bcoin.script.decode(encoded);
      assert.deepEqual(decoded, [ 1, [ 4, 231, 241, 102, 86, 177, 117, 81, 147, 82, 135 ] ])
      assert.equal(bcoin.script.getReadableScript(decoded, { type: 'scripthash', is_output: false, network: 'mainnet' }), '1 04e7f16656b17551935287')
    })
    it('should get a readable non standard script hash', function () {
      var hex = '5355540b6f93598893578893588851'
      var encoded = utils.toArray(hex, 'hex')
      var decoded = bcoin.script.decode(encoded);
      assert.deepEqual(decoded, [ 3, 5, 4, [ 111, 147, 89, 136, 147, 87, 136, 147, 88, 136, 81 ] ])
      assert.deepEqual(bcoin.script.getReadableScript(decoded, { type: 'scripthash', is_output: false, network: 'mainnet' }), '3 5 4 6f93598893578893588851')
    })
  })
});
