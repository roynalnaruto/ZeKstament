# ZeKstament
ZeKstament is a ÐApp built on [Ethereum](https://ethereum.org/), powered by [AZTEC Protocol](https://www.aztecprotocol.com/), that lets users create a zero knowledge testament for their Crypto Assets.

# Why
As Cryptocurrencies gain popularity around the globe, we will see an influx of new users buying Crypto Assets. As their journey presumably begins from exchanges like Coinbase, to Binance, some users will eventually find their way to securing their crypto assets by using hardware wallets.

Contrary to the traditional concepts of having the bank as a trusted authority holding an individual's funds, or legal documents expressing an individual's wishes to distribute private property upon death, there are no trusted authorities responsible for distributing one's crypto assets upon death.

ZeKstament allows users to nominate Ethereum addresses to pass on their crypto assets upon death (we will explain below what we consider "death" from Ethereum's perspective).

# Ideas
The preliminary thought was along the lines of [Shamir's Secret Sharing Scheme](https://en.wikipedia.org/wiki/Shamir%27s_Secret_Sharing). But a few points that came up in the discussion can be found in [this log](https://gist.github.com/roynalnaruto/603e36d31eda39c5470aeb33b397692b).

Confidentiality is of utmost importance while creating a testament of one's assets. Blockchain identities (public addresses) are pseudonymous, so our priority should be hiding the amounts allocated to each nominee in the testament's distribution. Knowledge of asset distribution can lead to a feeling of animosity amongst the various nominees.

We cannot rely on a multi sig wallet architecture for this purpose. Even if we protect funds from being unlocked before the testator's death, we cannot guarantee that `m` out of `n` nominees will be alive to unlock funds successfully (while keeping the distribution confidential).

A UTXO-like model with hidden note values/balances made the most sense, hence AZTEC.

# Build
* Fetch dependencies
```
yarn install
```
* Compile contracts
```
yarn truffle compile
```
* Start ganache (local Ethereum client)
```
yarn ganache-cli -a=20
```
* Test
```
yarn truffle test
```
* Deploy contracts to ganache
```
yarn truffle migrate
```
* Lint
```
yarn run lint
```
