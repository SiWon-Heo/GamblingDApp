const CommitRevealLottery = artifacts.require("CommitRevealLottery");
const truffleAssert = require("truffle-assertions");

contract("CommitRevealLottery", (accounts) => {
    console.log("accounts");

    let commitRevealLottery;

    // 1. check contract connection
    before(async () => {
        commitRevealLottery = await CommitRevealLottery.deployed();
        console.log(
            `commitRevealLottery address: ${commitRevealLottery.address}`
        );
    });

    // 2. check constructor value
    // 테스트 이전에 1_initial_migration.js 소스코드 주석처리해주기. 아니면 배포때마다 Migrations의 setCompleted() 함수가 호출돼서 트랜잭션 하나씩 추가해서 테스트 할때 블록넘버 안맞음.
    describe("Constructor", () => {
        it("commitCloses & revealCloses should be set correctly", async () => {
            const commitCloses = await commitRevealLottery.commitCloses();
            const revealCloses = await commitRevealLottery.revealCloses();
            const duration = await commitRevealLottery.DURATION();
            console.log(
                `commitCloses: ${commitCloses}, revealCloses: ${revealCloses}, DURATION: ${duration}`
            );

            const currentBlockNum = await web3.eth.getBlockNumber();
            console.log(`current block number: ${currentBlockNum}`);

            assert.equal(
                commitCloses.toString(),
                web3.utils.toBN(currentBlockNum).add(duration).toString()
            );
            assert.equal(revealCloses.toString(), commitCloses.add(duration));
        });
    });

    // 3. enter 기능 테스트
    describe("Enter", () => {
        it("Should revert if a player enters with less than .01 ETH", async () => {
            const enterAmt = web3.utils.toWei("0.009", "ether");
            const secret = 12345;
            const commit = web3.utils.keccak256(
                web3.utils.encodePacked(
                    { value: accounts[1], type: "address" },
                    { value: secret, type: "uint256" }
                )
            );
            console.log(`commit: ${commit}`);

            await truffleAssert.reverts(
                commitRevealLottery.enter(commit, {
                    from: accounts[1],
                    value: enterAmt,
                })
            );
        });

        it("Enter 3 players and check values", async () => {
            const enterAmt = web3.utils.toWei("0.01", "ether");

            // player 1 enter
            const secret1 = 12345;
            const commit1 = web3.utils.keccak256(
                web3.utils.encodePacked(
                    { value: accounts[1], type: "address" },
                    { value: secret1, type: "uint256" }
                )
            );
            console.log(`commit1: ${commit1}`);

            await commitRevealLottery.enter(commit1, {
                from: accounts[1],
                value: enterAmt,
            });

            // check values
            assert.equal(
                await commitRevealLottery.getBalance(),
                enterAmt,
                "0.01 ether not sent correctly by account1"
            );
            assert.equal(
                await commitRevealLottery.commitments(accounts[1]),
                commit1
            );
            // player 2 enter
            const secret2 = 12346;
            const commit2 = web3.utils.keccak256(
                web3.utils.encodePacked(
                    { value: accounts[2], type: "address" },
                    { value: secret2, type: "uint256" }
                )
            );
            console.log(`commit2: ${commit2}`);

            await commitRevealLottery.enter(commit2, {
                from: accounts[2],
                value: enterAmt,
            });

            // check values
            assert.equal(
                await commitRevealLottery.getBalance(),
                // 0.02 eth
                web3.utils.toBN(enterAmt).mul(web3.utils.toBN(2)).toString(),
                "0.01 ether not sent correctly by account2"
            );
            assert.equal(
                await commitRevealLottery.commitments(accounts[2]),
                commit2
            );
            // player 3 enter
            const secret3 = 12345;
            const commit3 = web3.utils.keccak256(
                web3.utils.encodePacked(
                    { value: accounts[3], type: "address" },
                    { value: secret3, type: "uint256" }
                )
            );
            console.log(`commit3: ${commit3}`);

            await commitRevealLottery.enter(commit3, {
                from: accounts[3],
                value: enterAmt,
            });

            // check values
            assert.equal(
                await commitRevealLottery.getBalance(),
                // 0.03 eth
                web3.utils.toBN(enterAmt).mul(web3.utils.toBN(3)).toString(),
                "0.01 ether not sent correctly by account3"
            );
            assert.equal(
                await commitRevealLottery.commitments(accounts[3]),
                commit3
            );
        });
    });
});
