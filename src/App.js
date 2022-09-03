import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import QRCode from "qrcode.react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faWallet, faPlus } from "@fortawesome/free-solid-svg-icons";
import { getBalance, readCount, setCount, fetchCardOf } from "./api/UseCaver";
// UseKlip 에 있는 getAddress 사용
import * as KlipAPI from "./api/UseKlip";
import * as KasAPI from "./api/UseKAS";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "./market.css";
import {
  Alert,
  Card,
  Container,
  Form,
  Nav,
  Button,
  Modal,
  Row,
  Col,
} from "react-bootstrap";
import { MARKET_CONTRACT_ADDRESS } from "./constants";

// 1. Smart contract 배포, 주소 파악(가져오기)
// 2. caver.js 이용해서 스마트 컨트랙트 연동하기
// 3. 가져온 스마트 컨트랙트 실행 결과(데이터) 웹에 표현하기

// 함수 작성법
// 1.
function onPressButton(balance) {
  console.log("hi");
}
// 2. 함수를 변수처럼 작성
const onPressButton2 = (_balance, _setBalance) => {
  console.log("hi2");
  _setBalance(_balance);
};

const DEFAULT_QR_CODE = "DEFAULT";
const DEFAULT_ADDRESS = "0x0000000000000000000000000000000000000000";
function App() {
  // State Data

  // Global Data(domain data)
  // address
  // nft

  // nft card 정보들
  const [nfts, setNfts] = useState([]); // {id: '101', uri: ''}
  const [myBalance, setMyBalance] = useState("0");
  const [myAddress, setMyAddress] = useState(DEFAULT_ADDRESS);
  // const [myAddress, setMyAddress] = useState("0x");

  // UI
  // qrcode 보기
  const [qrValue, setQrValue] = useState(DEFAULT_QR_CODE);
  // tab
  const [tab, setTab] = useState("MARKET"); // MARKET, MINT, WALLET
  // mintInput
  const [mintImageUrl, setMintImageUrl] = useState("");
  // klip
  const [mintTokenID, setMintTokenID] = useState("");
  // Modal
  const [showModal, setShowModal] = useState(false);
  // modal 관련 데이터
  const [modalProps, setModalProps] = useState({
    title: "MODAL",
    onConfirm: () => {},
  });

  // gallery settings
  const rows = nfts.slice(nfts.length / 2);

  // fetchMarketNFTs (market nft 가져오기)
  const fetchMarketNFTs = async () => {
    const _nfts = await fetchCardOf(MARKET_CONTRACT_ADDRESS);
    setNfts(_nfts);
  };
  // fetchMyNFTs (내 nft 가져오기)
  const fetchMyNFTs = async () => {
    // const _nfts = await fetchCardOf(
    //   "0x" // myAddress
    // );
    // 지갑이 연동 되었을 때만 nft 목록이 나옴.
    if (myAddress === DEFAULT_ADDRESS) {
      alert("NO ADDRESS");
      return;
    }
    const _nfts = await fetchCardOf(myAddress);
    console.log(myAddress);
    setNfts(_nfts);
    // [ { tokenId:100, tokenURI: "https://xx.png" }, { tokenId:101, tokenURI: "https://tt.jpg" } ]
    // balanceOf -> 내가 가진 전체 NFT 토큰 개수를 가져온다
    // 2
    // tokenOfOwnerByIndex -> 내가 가진 NFT token ID를 하나씩 가져온다 -> 배열로
    // 0x, 0 -> 100
    // 0x, 1 -> 101
    // tokenURI -> 앞에서 가져온 tokenID를 이용해서 tokenURI를 하나씩 가져온다 ->
    // 100 -> xx.png
    // 101 -> tt.jpg
  };
  // onClickMint (발행버튼 눌렀을 때 이벤트)
  const onClickMint = async (uri) => {
    // myAddress 가 DEFAULT_ADDRESS 이면 myAddress로 발행 안됨
    if (myAddress === DEFAULT_ADDRESS) {
      alert("NO ADDRESS");
      return;
    }
    const randomTokenId = parseInt(Math.random() * 10000000);
    KlipAPI.mintCardWithURI(
      myAddress,
      randomTokenId,
      uri,
      setQrValue,
      (result) => {
        alert(JSON.stringify(result));
      }
    );
  };
  // Klip연동
  // onClickMint (발행버튼 눌렀을 때 이벤트)
  // const onClickMint = async (uri, tokenId) => {
  //   // myAddress 가 DEFAULT_ADDRESS 이면 myAddress로 발행 안됨
  //   if (myAddress === DEFAULT_ADDRESS) {
  //     alert("NO ADDRESS");
  //     return;
  //   }
  //   // mint 과정
  //   // file upload => (option) asset upload api 이용
  //   // metadata upload (입력받은 이미지 주소를 가지고 메타데이터 업로드)
  //   const metadataURL = await KasAPI.uploadMetaData(uri);
  //   if (!metadataURL) {
  //     alert("메타 데이터 업로드에 실패하였습니다.");
  //     return;
  //   }
  //   // const randomTokenId = parseInt(Math.random() * 10000000);
  //   KlipAPI.mintCardWithURI(
  //     myAddress,
  //     tokenId,
  //     metadataURL, // metadata upload api에서 받은 주소
  //     setQrValue,
  //     (result) => {
  //     alert(JSON.stringify(result));
  //   });
  // };

  // onClickCard
  const onClickCard = (id) => {
    if (tab === "WALLET") {
      setModalProps({
        title: "NFT를 마켓에 올리시겠어요?",
        onConfirm: () => {
          onClickMyCard(id);
        },
      });
      setShowModal(true);
    }
    if (tab === "MARKET") {
      setModalProps({
        title: "NFT를 구매하시겠어요?",
        onConfirm: () => {
          onClickMarketCard(id);
        },
      });
      setShowModal(true);
    }
  };
  // onClickMyCard(카드 눌렀을 때 map에 올리기)
  // tokenId : 어떤 것을 safeTransferFrom 할 지 정해줌
  const onClickMyCard = (tokenId) => {
    KlipAPI.listingCard(myAddress, tokenId, setQrValue, (result) => {
      alert(JSON.stringify(result));
    });
  };
  // onClickMarketCard(마켓카드 클릭 시 구입)
  const onClickMarketCard = (tokenId) => {
    KlipAPI.buyCard(tokenId, setQrValue, (result) => {
      alert(JSON.stringify(result));
    });
  };

  // getUserData
  const getUserData = () => {
    setModalProps({
      title: "Klip 지갑을 연동하시겠습니까?",
      onConfirm: () => {
        // address : UseKlip.js/ getAddress / res.data.result.klaytn_address
        KlipAPI.getAddress(setQrValue, async (address) => {
          setMyAddress(address);
          // 가져온 주소를 바탕으로 잔고 가져오기
          const _balance = await getBalance(address);
          setMyBalance(_balance);
        });
      },
    });
    setShowModal(true);
  };

  useEffect(() => {
    getUserData(); // klip 연동하기
    fetchMarketNFTs(); // Market에 있는 nft card 가져오기
  }, []);
  return (
    <div className="App">
      <div style={{ backgroundColor: "black", padding: 10 }}>
        {/* 주소, 잔고 */}
        <div
          style={{
            fontSize: 30,
            fontWeight: "bold",
            paddingLeft: 5,
            marginTop: 10,
          }}
        >
          내 지갑
        </div>
        {myAddress}
        <br />
        <Alert
          onClick={getUserData}
          variant={"balance"}
          style={{ backgroundColor: "#f40075", fontSize: 25 }}
        >
          {myAddress !== DEFAULT_ADDRESS
            ? `${myBalance} KLAY`
            : "지갑 연동하기"}
        </Alert>
        {qrValue != "DEFAULT" ? (
          <Container
            style={{
              backgroundColor: "white",
              width: 300,
              height: 300,
              padding: 20,
            }}
          >
            <QRCode value={qrValue} size={256} style={{ margin: "auto" }} />
            <br />
            <br />
          </Container>
        ) : null}
        {/* 갤러리(마켓, 내 지갑) */}
        {tab === "MARKET" || tab === "WALLET" ? (
          <div className="container" style={{ padding: 0, width: "100%" }}>
            {rows.map((o, rowIndex) => (
              <Row key={`rowkey${rowIndex}`}>
                <Col style={{ marginRight: 0, paddingRight: 0 }}>
                  <Card
                    onClick={() => {
                      onClickCard(nfts[rowIndex * 2].id);
                    }}
                  >
                    <Card.Img src={nfts[rowIndex * 2].uri} />
                  </Card>
                  [{nfts[rowIndex * 2].id}]NFT
                </Col>
                <Col style={{ marginRight: 0, paddingRight: 0 }}>
                  {nfts.length > rowIndex * 2 + 1 ? (
                    <Card
                      onClick={() => {
                        onClickCard(nfts[rowIndex * 2 + 1].id);
                      }}
                    >
                      <Card.Img src={nfts[rowIndex * 2 + 1].uri} />
                    </Card>
                  ) : null}
                  {nfts.length > rowIndex * 2 + 1 ? (
                    <>[{nfts[rowIndex * 2 + 1].id}]NFT</>
                  ) : null}
                </Col>
              </Row>
            ))}
            {/* {nfts.map((nft, index) => (
              <Card.Img
                key={`imagekey${index}`}
                onClick={() => {
                  onClickCard(nft.id); // id : UseCaver.js nfts
                }}
                className="img-responsive" src={nfts[index].uri} />
            ))} */}
          </div>
        ) : null}
        {/* 발행 페이지 */}
        {tab === "MINT" ? (
          <div className="container" style={{ padding: 0, width: "100%" }}>
            <Card
              className="text-center"
              style={{ color: "black", height: "50%", borderColor: "#C5B358" }}
            >
              <Card.Body style={{ opacity: 0.9, backgroundColor: "black" }}>
                {/* ImageUrl 이 있으면 보여주기 */}
                {mintImageUrl != "" ? (
                  <Card.Img src={mintImageUrl} height={"50%"} />
                ) : null}
                <Form>
                  <Form.Group>
                    <Form.Control
                      value={mintImageUrl}
                      onChange={(e) => {
                        console.log(e.target.value);
                        setMintImageUrl(e.target.value);
                      }}
                      type="text"
                      placeholder="이미지 주소를 입력해주세요"
                    />
                    {/* Klip연동 */}
                    {/* <br />
                    <Form.Control
                      value={mintTokenID}
                      onChange={(e) => {
                        console.log(e.target.value);
                        setMintTokenID(e.target.value);
                      }}
                      type="text"
                      placeholder="토큰 ID를 입력해주세요"
                    /> */}
                  </Form.Group>
                  <br />
                  <Button
                    // mint 버튼 클릭 시
                    onClick={() => {
                      onClickMint(mintImageUrl);
                      // Klip연동
                      // onClickMint(mintImageUrl, mintTokenID);
                    }}
                    variant="primary"
                    style={{
                      backgroundColor: "#810034",
                      borderColor: "#810034",
                    }}
                  >
                    발행하기
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </div>
        ) : null}
      </div>
      <br />
      <br />
      <br />
      <br />
      {/* 모달 */}
      <Modal
        centered
        size="sm"
        show={showModal}
        onHide={() => {
          setShowModal(false);
        }}
      >
        <Modal.Header
          closeButton
          style={{ border: 0, backgroundColor: "black", opacity: 0.8 }}
        >
          <Modal.Title>{modalProps.title}</Modal.Title>
        </Modal.Header>
        <Modal.Footer
          style={{ border: 0, backgroundColor: "black", opacity: 0.8 }}
        >
          <Button
            variant="secondary"
            onClick={() => {
              setShowModal(false);
            }}
          >
            닫기
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              modalProps.onConfirm();
              setShowModal(false);
            }}
            style={{ backgroundColor: "#810034", borderColor: "#810034" }}
          >
            진행
          </Button>
        </Modal.Footer>
      </Modal>
      {/* <button onClick={fetchMyNFTs}>NFT 가져오기</button> */}
      {/* 탭 */}
      <nav
        style={{ backgroundColor: "#1b1717", height: 45 }}
        className="navbar fixed-bottom navbar-light"
        role="navigation"
      >
        <Nav className="w-100">
          <div className=" d-flex flex-row justify-content-around w-100">
            <div
              onClick={() => {
                // onClick 시 tab 변수를 MARKET 으로 변경
                setTab("MARKET");
                // MARKET tab 누르면 MARKET이 가진 nft card 받아오기
                fetchMarketNFTs();
              }}
              className="row d-flex flex-column justify-content-center align-items-center"
            >
              <div>
                <FontAwesomeIcon color="white" size="lg" icon={faHome} />
              </div>
            </div>
            <div
              onClick={() => {
                setTab("MINT");
              }}
              className="row d-flex flex-column justify-content-center align-items-center"
            >
              <div>
                <FontAwesomeIcon color="white" size="lg" icon={faPlus} />
              </div>
            </div>
            <div
              onClick={() => {
                setTab("WALLET");
                // WALLET tab 누르면 WALLET이 가진 nft card 받아오기
                fetchMyNFTs();
              }}
              className="row d-flex flex-column justify-content-center align-items-center"
            >
              <div>
                <FontAwesomeIcon color="white" size="lg" icon={faWallet} />
              </div>
            </div>
          </div>
        </Nav>
      </nav>
    </div>
  );
}

export default App;
