function normalizeAmount(amount, divisible) {
  return divisible ? Decimal.round(new Decimal(amount).div(UNIT), 8).toFloat() : amount;
}

function randomGetBytes(numBytes) {
     var randomBytes = null;
    if (window.crypto && window.crypto.getRandomValues) {
        // First we're going to try to use a built-in CSPRNG (newer Chrome, Firefox, etc)
        randomBytes = new Uint8Array(numBytes);
        window.crypto.getRandomValues(randomBytes);
    } else if (window.msCrypto && window.msCrypto.getRandomValues) {
        // Because of course IE calls it msCrypto instead of being standard
        randomBytes = new Uint8Array(numBytes);
        window.msCrypto.getRandomValues(randomBytes);
    } else {
        //Fallback to SecureRandom, for older browsers
        randomBytes = new Array(numBytes);
        rng_get_bytes(randomBytes);
    }
    return randomBytes;
}

function dumpScript(script) { /* orig from tx.js (public domain) */
    var out = [];
    for (var i = 0; i < script.chunks.length; i++) {
        var chunk = script.chunks[i];
        var op = new Bitcoin.Opcode(chunk);
        typeof chunk == 'number' ?  out.push(op.toString()) :
            out.push(Bitcoin.convert.bytesToHex(chunk));
    }
    return out.join(' ');
}

function parseBCIUnspent(r) { /* orig from tx.js (public domain) */
  var txs = r.unspent_outputs;
  if (!txs)
      throw 'Not a BCI format';

  delete unspenttxs;
  var unspenttxs = {};
  var balance = Bitcoin.BigInteger.ZERO;
  for(var i = 0; i < txs.length; i++) {
      var o = txs[i];
      var lilendHash = o.tx_hash;

      //convert script back to BBE-compatible text
      var script = dumpScript( new Bitcoin.Script(Bitcoin.convert.hexToBytes(o.script)) );

      var value = new Bitcoin.BigInteger('' + o.value, 10);
      if (!(lilendHash in unspenttxs))
          unspenttxs[lilendHash] = {};
      unspenttxs[lilendHash][o.tx_output_n] = {amount: value, scriptText: script, script: o.script};
      balance = balance.add(value);
  }
  return {balance:balance, unspentTxs: unspenttxs};
}