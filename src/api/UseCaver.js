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

