const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {

	instance = await StarNotary.deployed();
    let tokenId = 1;

    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
	instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let tokenId = 1;
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
	instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
	instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
	instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests
it('can add the star name and star symbol properly', async() => 
{
	instance = await StarNotary.deployed();
	let user1 = accounts[0];
	let starId = 55;
	await instance.createStar('test55', starId, {from: user1});
	let tokenName = await instance.TOKEN_NAME.call();
	let tokenSymbol = await instance.TOKEN_SYMBOL.call();
	assert.equal(tokenName, "m star token");
	assert.equal(tokenSymbol, "MST");
});

it('lets 2 users exchange stars', async() => 
{
	instance = await StarNotary.deployed();
	let user1 = accounts[0];
	let user2 = accounts[1];
	let starId1 = 35;
	let starId2 = 36;
	// creating star test1 from user1
	await instance.createStar('test1', starId1, {from: user1});

	// creating star test 2 from user 2
	await instance.createStar('test2', starId2, {from: user2});

	// exchanging the stars
	await instance.exchangeStars(starId1, starId2);

	// verify ownership has been changed and exchange was successful
	assert.equal(await instance.ownerOf(starId1), user2);
	assert.equal(await instance.ownerOf(starId2), user1);
});

it('lets a user transfer a star', async() => 
{
	instance = await StarNotary.deployed();
	let user1 = owner;
	let user2 = accounts[1];
	let starId = 7;	
	let starName = 'test3';

	// check if star exists
	let existingStarName = await instance.lookUptokenIdToStarInfo(starId);
	assert(existingStarName !== "") // star doesn't exist

	// creating star
	await instance.createStar(starName, starId, {from: user1});

	// do the transfer
	await instance.transferFrom(user1, user2, starId);
	// verifying ownership by previous transfer
	assert.equal(await instance.ownerOf(starId),  user2);
});

it('lookUptokenIdToStarInfo test', async() => 
{
	instance = await StarNotary.deployed();
	let user1 = accounts[0];
	let starId = 8;
	let name = 'test4'
	await instance.createStar(name, starId, {from: user1});
	assert.equal(name, await instance.lookUptokenIdToStarInfo(starId));
});  

