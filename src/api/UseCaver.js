import Caver from "caver-js";
import axios from "axios";
// import CounterABI from '../abi/CounterABI.json';
import KIP17ABI from "../abi/KIP17TokenABI.json";
import {
  ACCESS_KEY_ID,
  SECRET_ACCESS_KEY,
  COUNT_CONTRACT_ADDRESS,
  NFT_CONTRACT_ADDRESS,
  CHAIN_ID,
} from "../constants";

const option = {
  headers: [
    {
      name: "Authorization",
      value:
        "Basic " +
        Buffer.from(ACCESS_KEY_ID + ":" + SECRET_ACCESS_KEY).toString("base64"),
    },
    { name: "x-chain-id", value: CHAIN_ID },
  ],
};

// 누구한테 가서 실행할지
const caver = new Caver(
  new Caver.providers.HttpProvider(
    "https://node-api.klaytnapi.com/v1/klaytn",
    option
  )
);
// ABI(사용설명서)랑 nft contract 주소(KIP17Token) 넣어줌
const NFTContract = new caver.contract(KIP17ABI, NFT_CONTRACT_ADDRESS);

// 특정 주소가 가지고 있는 card의 nft uri, tokenId 배열을 return 하는 함수
// 외부 호출 함수 : async 써주기
export const fetchCardOf = async (address) => {
  // Fetch Balance
  // nft card 개수의 balance
  const balance = await NFTContract.methods.balanceOf(address).call();
  console.log(`[NFT Balance]${balance}`);
  // Fetch Token IDs
  const tokenIds = [];
  for (let i = 0; i < balance; i++) {
    const id = await NFTContract.methods.tokenOfOwnerByIndex(address, i).call();
    tokenIds.push(id);
  }
  // Fetch Token URIs
  const tokenUris = [];
  for (let i = 0; i < balance; i++) {
    const uri = await NFTContract.methods.tokenURI(tokenIds[i]).call();
    tokenUris.push(uri);
  }

  // Fetch Token URIs Klip연동 **********
  // const tokenUris = [];
  // for (let i = 0; i < balance; i++) {
  //   const metadataUrl = await NFTContract.methods.tokenURI(tokenIds[i]).call(); // -> metadata kas 주소
  //   const response = await axios.get(metadataUrl); // 실제 메타데이터가 들어있다.
  //   const uriJSON = response.data; // image key 값
  //   tokenUris.push(uriJSON.image); // 받은 image key 값을 tokenUris에 넣어줌
  // }
  // console.log(`${tokenIds}`);
  // console.log(`${tokenUris}`);
  // console.log(`${tokenUris[0]}`);
  // console.log(`${tokenUris[1]}`);
  const nfts = [];
  for (let i = 0; i < balance; i++) {
    nfts.push({ uri: tokenUris[i], id: tokenIds[i] });
  }
  console.log(nfts);
  return nfts;
};

// 특정 주소에 대한 잔고 가져오기
export const getBalance = (address) => {
  // 클레이 가져오기, 답변오면 (then)
  return caver.rpc.klay.getBalance(address).then((response) => {
    // hexToNumberString : response 16진수를 문자로 변경
    // convertFromPeb : 읽을 수 있는 KLAY단위로 변경. 1 KLAY = 10 ** 18 PEB
    const balance = caver.utils.convertFromPeb(
      caver.utils.hexToNumberString(response)
    );
    console.log(`BALANCE: ${balance}`);
    return balance;
  });
};

// const CountContract = new caver.contract(CounterABI, COUNT_CONTRACT_ADDRESS);

// // 읽을 때 : 그 주소에 가서 count 실행 (count는 ABI에서 가져옴)
// export const readCount = async () => {
//   const _count = await CountContract.methods.count().call();
//   console.log(_count);
// }

// //
// export const setCount = async (newCount) => {
//   // 외부 호출 시 문제 발생 가능. trycatch
//   // 사용할 account 설정
//   try {
// 	const privatekey = '0x8daed3cd370c094ef31006d82dd747c5980e2cc69e1f999d2d5fc01e3b3d4130';
// 	const deployer = caver.wallet.keyring.createFromPrivateKey(privatekey);
// 	caver.wallet.add(deployer);
// 	// 스마트 컨트랙트 실행 트랜잭션 날리기
// 	const receipt = await CountContract.methods.setCount(newCount).send({
// 	  from: deployer.address, //address
// 	  gas: "0x4bfd200" // 수수료. 아무 숫자나 넣어도 트랜잭션에 필요한 만큼만 사용하고 되돌아 옴
// 	});
// 	// 결과 출력
// 	console.log(receipt);
//   } catch (e) {
// 	console.log(`[ERROR_SET_COUNT]${e}`);
//   }
// }
