import axios from "axios";
import {
  COUNT_CONTRACT_ADDRESS,
  MARKET_CONTRACT_ADDRESS,
  NFT_CONTRACT_ADDRESS,
} from "../constants";

const A2A_PREPARE_URL = "https://a2a-api.klipwallet.com/v2/a2a/prepare";
const APP_NAME = "KLAY_MARKET";
const isMobile = window.screen.width >= 1280 ? false : true;

// Klip 에 Access 하는 url 가져오는 방식
const getKlipAccessUrl = (method, request_key) => {
  if (method === "QR") {
    return `https://klipwallet.com/?target=/a2a?request_key=${request_key}`;
  }
  if (method === "iOS") {
    return `kakaotalk://klipwallet/open?url=https://klipwallet.com/?target=/a2a?request_key=${request_key}`;
  }
  if (method === "android") {
    return `kakaotalk://klipwallet/open?url=https://klipwallet.com/?target=/a2a?request_key=${request_key}`;
  }
  return `kakaotalk://klipwallet/open?url=https://klipwallet.com/?target=/a2a?request_key=${request_key}`;
};

// 마켓에서 구매 - buyNFT 함수 (Market Contract)
export const buyCard = async (tokenId, setQrValue, callback) => {
  // 실행할 함수에 대한 abi (buyNFT from MarketABI.json)
  const functionJson =
    ' { "constant": false, "inputs": [ { "name": "tokenId", "type": "uint256" }, { "name": "NFTAddress", "type": "address" } ], "name": "buyNFT", "outputs": [ { "name": "", "type": "bool" } ], "payable": true, "stateMutability": "payable", "type": "function" }';
  executeContract(
    MARKET_CONTRACT_ADDRESS,
    functionJson,
    "10000000000000000",
    `[\"${tokenId}\",\"${NFT_CONTRACT_ADDRESS}\"]`,
    setQrValue,
    callback
  );
};

// 마켓에 판매 - safeTransferFrom 함수 (KIP17Token Contract)
// tokenId를 무조건 마켓한테 보냄. (to 필요x)
export const listingCard = async (
  fromAddress,
  tokenId,
  setQrValue,
  callback
) => {
  // 실행할 함수에 대한 abi (safeTransferFrom from KIP17TokenABI.json)
  const functionJson =
    ' { "constant": false, "inputs": [ { "name": "from", "type": "address" }, { "name": "to", "type": "address" }, { "name": "tokenId", "type": "uint256" } ], "name": "safeTransferFrom", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }';
  executeContract(
    NFT_CONTRACT_ADDRESS,
    functionJson,
    "0",
    `[\"${fromAddress}\",\"${MARKET_CONTRACT_ADDRESS}\",\"${tokenId}\"]`,
    setQrValue,
    callback
  );
};

// klip api 에서 card mint 하는 함수
export const mintCardWithURI = async (
  toAddress,
  tokenId,
  uri,
  setQrValue,
  callback
) => {
  // 실행할 함수에 대한 abi (mintWithTokenURI from KIP17TokenABI.json)
  const functionJson =
    ' { "constant": false, "inputs": [ { "name": "to", "type": "address" }, { "name": "tokenId", "type": "uint256" }, { "name": "tokenURI", "type": "string" } ], "name": "mintWithTokenURI", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }';
  executeContract(
    NFT_CONTRACT_ADDRESS,
    functionJson,
    "0",
    `[\"${toAddress}\",\"${tokenId}\",\"${uri}\"]`,
    setQrValue,
    callback
  );
};

// 컨트랙트 실행 함수
export const executeContract = (
  txTo,
  functionJson,
  value,
  params,
  setQrValue,
  callback
) => {
  axios
    // prepare 지갑사용해도 되니?
    .post(
      A2A_PREPARE_URL,
      {
        // parameters
        bapp: {
          name: APP_NAME,
        },
        // 스마트 컨트랙트 실행
        type: "execute_contract",
        transaction: {
          to: txTo, // 스마트 컨트랙트 주소 (KIP17Token)
          // 어떠한 함수를 실행 하겠다 적어줌. setCount
          abi: functionJson,
          value: value, //klay 값.
          params: params, // parameters
        },
      }
      // axios.post 실행 후 결과를 response에 넣어줌
    )
    .then((response) => {
      // prepare 사용 시 유저가 인증한 다음 request_key 값을 가져오기
      const { request_key } = response.data;
      // 모바일인 경우 앱이랑 바로 연결
      if (isMobile) {
        window.location.href = getKlipAccessUrl("iOS", request_key);
      } else {
        setQrValue(getKlipAccessUrl("QR", request_key));
      }
      // // 가져온 request_key 값을 qrcode로 보내줌
      // const qrcode = `https://klipwallet.com/?target=/a2a?request_key=${request_key}`;
      // // 생성된 qrcode로 잡아줌
      // setQrValue(qrcode);
      // result. 결과값을 가져오기
      // 1초에 한번씩 호출
      // 특정 조건 맞으면 해제
      let timerId = setInterval(() => {
        // 결과값 가져오기
        axios
          .get(
            `https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${request_key}`
          )
          .then((res) => {
            // response 안에 데이터 있으면 (result값)
            if (res.data.result) {
              console.log(`[Result] ${JSON.stringify(res.data.result)}`);
              callback(res.data.result);
              clearInterval(timerId);
              setQrValue("DEFAULT"); // 결과값 가져온 이후 DEFAULT로 초기화
            }
          });
      }, 1000);
    });
};

// App.js에서 setQrValue 함수를 넘겨받아
// UseKlip.js 에서 setQrValue함수를 인자로 같는 getAddress 함수 실행
export const getAddress = (setQrValue, callback) => {
  // axios : 외부 서버 호출 시 get, post, put.. function을 사용할 수 있게 도와주는 라이브러리
  // prepare 사용 주소
  axios
    .post(
      A2A_PREPARE_URL,
      {
        // parameters
        bapp: {
          name: APP_NAME,
        },
        type: "auth",
      }
      // axios.post 실행 후 결과를 response에 넣어줌
    )
    .then((response) => {
      // prepare 사용 시 유저가 인증한 다음 request_key가 넘어옴
      // const request_key = response.data.request_key;
      // 짧게 쓰기
      const { request_key } = response.data;
      // 모바일인 경우 앱이랑 바로 연결
      if (isMobile) {
        window.location.href = getKlipAccessUrl("iOS", request_key);
      } else {
        setQrValue(getKlipAccessUrl("QR", request_key));
      }
      // // url 형식의 qrcode 생성
      // const qrcode = `https://klipwallet.com/?target=/a2a?request_key=${request_key}`;
      // // 생성된 qrcode로 잡아줌
      // setQrValue(qrcode);
      // result. 결과값을 가져오기
      // 1초에 한번씩 호출
      // 특정 조건 맞으면 해제
      let timerId = setInterval(() => {
        // 결과값 가져오기
        axios
          .get(
            `https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${request_key}`
          )
          .then((res) => {
            // response 안에 데이터 있으면 (result값)
            if (res.data.result) {
              console.log(`[Result] ${JSON.stringify(res.data.result)}`);
              callback(res.data.result.klaytn_address);
              // 값이 왔을 경우 (result값 생김)
              // 1초마다 실행하는 것을 없애줌. 타이머 해제
              clearInterval(timerId);
              setQrValue("DEFAULT");
            }
          });
      }, 1000);
    });
};

// export const setCount = (count, setQrValue) => {
//   axios
//   // prepare 지갑사용해도 되니?
//     .post(A2A_PREPARE_URL,{
//       // parameters
//       bapp: {
//         name: APP_NAME,
//         },
//         // 스마트 컨트랙트 실행
//         type: "execute_contract",
//         transaction: {
//           to: COUNT_CONTRACT_ADDRESS, // 스마트 컨트랙트 주소
//           // 어떠한 함수를 실행 하겠다 적어줌. setCount
//           abi: '{ "constant": false, "inputs": [ { "name": "_count", "type": "uint256" } ], "name": "setCount", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }',
//           value: "0", //klay 값. 여기선 사용x
//           params: `[\"${count}\"]`, // parameters
//         }
//       }
//     // axios.post 실행 후 결과를 response에 넣어줌
//     ).then((response) => {
//       // prepare 사용 시 유저가 인증한 다음 request_key 값을 가져오기
//       const { request_key } = response.data;
//       // 가져온 request_key 값을 qrcode로 보내줌
//       const qrcode = `https://klipwallet.com/?target=/a2a?request_key=${request_key}`;
//       // 생성된 qrcode로 잡아줌
//       setQrValue(qrcode);
//       // result. 결과값을 가져오기
//       // 1초에 한번씩 호출
//       // 특정 조건 맞으면 해제
//       let timerId = setInterval(() => {
//         // 결과값 가져오기
//         axios
//           .get(`https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${request_key}`
//           )
//           .then((res) => {
//             // response 안에 데이터 있으면 (result값)
//             if (res.data.result) {
//               console.log(`[Result] ${JSON.stringify(res.data.result)}`);
//               clearInterval(timerId);
//             }
//           });
//       }, 1000);
//     });
// };
