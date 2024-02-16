import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect, assert } from "chai";
  import { ethers } from "hardhat";
  
  
  describe("SaveERC20 Contract Test", function () {
    async function deploySave(){
      const ERC20 = await ethers.getContractFactory("ERC20");
      const erc20 = await ERC20.deploy();

      const Save = await ethers.getContractFactory("Save");
      const save = await Save.deploy(erc20);


      const [account1, account2] = await ethers.getSigners();
      const amountToDeposit = 100;
      return { erc20, save, account1, account2, amountToDeposit };
    };

    async function approveERC20(account: any, address: any, amount: any){
      const { erc20 } = await loadFixture(deploySave);
      const address2Signer= await ethers.getSigner(account.address);
      await erc20.connect(address2Signer).approve(address, amount);
    };
  
  
    describe("Contract", async () => {
        it("can deposit token and check token savings balance", async () => {
            const { save, account1, amountToDeposit} = await loadFixture(deploySave);
            await approveERC20(account1, save.target, amountToDeposit) //Approve Contract

            await save.depositToken(amountToDeposit);

            const balance= await save.checkTokenSavings(account1.address)
            expect(balance).to.equal(amountToDeposit);
        });

        it("can deposit ether and check ethers savings balance", async () => {
            const { save, account1, amountToDeposit} = await loadFixture(deploySave);
            await save.depositEther({ value: amountToDeposit });

            const balance = await save.checkEtherSavings(account1.address);
            expect(balance).to.equal(amountToDeposit);
        });

        it("can check Token contract balance", async () => {
            const { save, account1, amountToDeposit} = await loadFixture(deploySave);
            await approveERC20(account1, save.target, amountToDeposit) //Approve Contract
  
            await save.depositToken(amountToDeposit);
  
            const balance= await save.checkTokenContractBal()
  
            expect(balance).to.equal(amountToDeposit);
          });
        
        it("can check Ether contract balance", async () => {
            const { save, account1, amountToDeposit} = await loadFixture(deploySave);
  
            await save.depositEther({ value: amountToDeposit });
  
            const balance= await save.checkEtherContractBal()
  
            expect(balance).to.equal(amountToDeposit);
          });

        it("can withdraw ethers saving successfully ", async()=>{
            const { save, account1, amountToDeposit} = await loadFixture(deploySave);

            await save.depositEther({ value: amountToDeposit });

            const afterDepositBalance = await save.checkEtherSavings(account1.address);

            expect(afterDepositBalance).to.equal(amountToDeposit);

            await save.withdrawEther();
            const afterWithdrawBalance = await save.checkEtherSavings(account1.address);
            expect(afterWithdrawBalance).to.equal(0);
        })

        it("can withdraw token saving successfully ", async()=>{
            const { save, account1, amountToDeposit} = await loadFixture(deploySave);

            await approveERC20(account1, save.target, amountToDeposit) //Approve Contract
            await save.depositToken(amountToDeposit);

            await save.withdrawToken();
            const afterWithdrawalBalance= await save.checkTokenContractBal();

            expect(afterWithdrawalBalance).to.equal(0);
        })

        it("can deposit token and Ether and check all balance", async () => {
            const { save, account1, amountToDeposit} = await loadFixture(deploySave);
            await approveERC20(account1, save.target, amountToDeposit) //Approve Contract

            await save.deposit(amountToDeposit, { value: amountToDeposit });

            const balance= await save.checkSavings(account1.address)
 
            expect(balance[0]).to.equal(amountToDeposit);
            expect(balance[1]).to.equal(amountToDeposit);
        });

        it("can withdraw all  saving successfully ", async()=>{
            const { save, account1, amountToDeposit} = await loadFixture(deploySave);

            await approveERC20(account1, save.target, amountToDeposit) //Approve Contract

            await save.deposit(amountToDeposit, { value: amountToDeposit });

            const balance= await save.checkSavings(account1.address)
 
            expect(balance[0]).to.equal(amountToDeposit);
            expect(balance[1]).to.equal(amountToDeposit);

            await save.withdraw();

        })






        // it("can check contract balance", async () => {
        //   const { save, account1, amountToDeposit} = await loadFixture(deploySave);
        //   await approveERC20(account1, save.target, amountToDeposit) //Approve Contract

        //   await save.deposit(amountToDeposit);

        //   const balance= await save.checkContractBalance()

        //   expect(balance).to.equal(amountToDeposit);
        // });

        // it("can withdraw", async () => {
        //   const { save, account1, amountToDeposit} = await loadFixture(deploySave);
        //   await approveERC20(account1, save.target, amountToDeposit) //Approve Contract
        //   await save.deposit(amountToDeposit);

        //   const amountToWithdraw= 50;
        //   await save.withdraw(amountToWithdraw);
        //   const afterWithdrawalBalance= await save.checkContractBalance();

        //   const expecedBalance= amountToDeposit - ((0.1*amountToWithdraw)+amountToWithdraw)
        //   expect(afterWithdrawalBalance).to.equal(expecedBalance);
        // });

        // it("money can be withdrawn by owner", async () => {
        //   const { erc20, save, account1, account2, amountToDeposit} = await loadFixture(deploySave);
        //   const erc20Minted= 1000;
        //   await erc20.transfer(account2.address, erc20Minted);

          
        //   const balanceof= await erc20.balanceOf(account2.address);
        //   const balanceof1= await erc20.balanceOf(account1.address);

        //   await approveERC20(account2, save.target, amountToDeposit) //Approve Contract
        //   const address2Signer= await ethers.getSigner(account2.address);
        //   await save.connect(address2Signer).deposit(amountToDeposit);
          
        //   // const balance= await save.checkContractBalance()
        //   // console.log(balance)
        //   // const amountToWithdraw= 50;
        //   // await save.ownerWithdraw(amountToWithdraw);
        //   // const afterWithdrawalBalance= await save.checkContractBalance();

        //   // const expecedBalance= amountToDeposit - ((0.1*amountToWithdraw)+amountToWithdraw)
        //   // expect(afterWithdrawalBalance).to.equal(expecedBalance);
        // });
    })     
           
  });

