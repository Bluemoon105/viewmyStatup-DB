import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import orderByStartup from "./orderByFunction.js";
import asyncHandler from "./asyncHandlerFunction.js";
import paginationHandler from "./paginationHandler.js";
import { CreateInvest, PatchInvest } from "./structs.js";
import { assert } from "superstruct";

dotenv.config();

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use(cors());


// const corsOption = {
//   origin: [
//     "http://127.0.0.1:3000",
//     "http://localhost:3000",
//     "http://localhost:3001",
//   ],
// };

// app.use(cors({
//   origin: 'http://localhost:3000', // 허용할 클라이언트 출처
//   methods: ['GET', 'POST', 'OPTIONS'], // 허용할 HTTP 메서드
//   credentials: true // 인증 정보(쿠키 등) 허용
// }));


// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // Replace with your frontend's origin
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Add any other necessary headers
//   next();
// });

app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204);
});


// BigInt 값을 문자열로 변환하여 JSON 응답 생성
function replacer(key, value) {
  return typeof value === 'bigint' ? value.toString() : value;
}
app.get(
  "/api/startups",
  asyncHandler(async (req, res) => {
    const { offset = 0, limit = 10, order = "id" } = req.query;
    // validation은 값이 들어오자마자 검사를 해야 큰 실수를 줄일 수 있음.
    const offsetNum = parseInt(offset);
    const limitNum = parseInt(limit);

    const orderBy = orderByStartup(order);
    const startups = await prisma.startup.findMany({
      orderBy,
      skip: offsetNum,
      take: limitNum,
      include: { Category: true },
    });

    const responseData = await paginationHandler(startups, offsetNum, limitNum);

    // BigInt 값을 문자열로 변환하여 JSON 응답 생성
    res.send(JSON.stringify(responseData, replacer));
  })
);

app.get("/api/startups/search", async (req, res) => {
  const { searchKeyword, offset = 0, limit = 10 } = req.query;
  const offsetNum = parseInt(offset);
  const limitNum = parseInt(limit);

  const replacer = (key, value) =>
    typeof value === "bigint" ? value.toString() : value;

  try {
    const totalCount = await prisma.startup.count({
      where: {
        name: { contains: searchKeyword },
      },
    });

    const startups = await prisma.startup.findMany({
      orderBy: { id: "asc" },
      skip: offsetNum,
      take: limitNum,
      where: {
        name: { contains: searchKeyword },
      },
    });

    res.setHeader("X-Total-Count", totalCount);

    const serializedStartups = JSON.stringify(startups, replacer);
    res.send(serializedStartups);
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
});

//특정 기업 상세 조회
app.get(
  "/api/startups/:startupsId",
  asyncHandler(async (req, res) => {
    const { startupsId } = req.params;
    const idNum = parseInt(startupsId, 10);
    const startup = await prisma.startup.findUniqueOrThrow({
      where: { id: idNum },
    });
    res.send(JSON.stringify(startup, replacer));
  })
);

app.get(
  "/api/startups/:startupsId/rank",
  asyncHandler(async (req, res) => {
    const { startupsId } = req.params;
    const idNum = parseInt(startupsId);
    const startup = await prisma.startup.findMany({
      where: { id: idNum },
    });
    res.send(JSON.stringify(startup, replacer));
  })
);

//기업 선택 횟수 조회
app.get(
  "/api/selections",
  asyncHandler(async (req, res) => {
    const { offset = 0, limit = 10, order = "countDesc" } = req.query;
    const offsetNum = parseInt(offset);
    const limitNum = parseInt(limit);

    const orderBy = orderByStartup(order);
    const startups = await prisma.startup.findMany({
      orderBy,
      skip: offsetNum,
      take: limitNum,
      include: { Category: true },
    });

    const responseData = await paginationHandler(startups, offsetNum, limitNum);

    // BigInt 값을 문자열로 변환하여 JSON 응답 생성
    res.send(JSON.stringify(responseData, replacer));
  })
);

//전체 투자 현황 조회
app.get(
  "/api/investments",
  asyncHandler(async (req, res) => {
    const { offset = 0, limit = 10, order = "simInvestDesc" } = req.query;
    const offsetNum = parseInt(offset);
    const limitNum = parseInt(limit);

    const orderBy = orderByStartup(order);
    const startups = await prisma.startup.findMany({
      orderBy,
      skip: offsetNum,
      take: limitNum,
      include: { Category: true },
    });

    const responseData = await paginationHandler(startups, offsetNum, limitNum);

    // BigInt 값을 문자열로 변환하여 JSON 응답 생성
    res.send(JSON.stringify(responseData, replacer));
  })
);
//투자자 상제 조회 
app.get("/investments/:id", async (req, res) => {
  const {id} = req.params;
  const numId = parseInt(id, 10);
  try {
    const investor = await prisma.mockInvestor.findUnique({
      where: { id: numId },
    });
    const serializedStartups = JSON.stringify(investor, replacer); res.send(serializedStartups);
  }catch(error) {res.status(404).send({message: error.message}); }
});


//특정 기업에 투자
app.post("/api/investments", async (req, res) => {
  assert(req.body, CreateInvest);
  try {
    const createdInvest = await prisma.mockInvestor.create({
      data: req.body,
    });
    const serializedInvest = JSON.stringify(createdInvest, replacer);
    res.send(serializedInvest);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});


//투자 수정
app.patch("/api/investments/:id", async (req, res) => {
  const { id } = req.params;
  const numId = parseInt(id, 10);
  assert(req.body, PatchInvest);
  try {
    const updateInvest = await prisma.mockInvestor.update({
      data: req.body,
      where: {
        startupId: numId,
      },
    });
    const serializedStartups = JSON.stringify(updateInvest, replacer);
    res.send(serializedStartups);
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
});
  //투자 삭제
  app.delete("/api/investments/:id", async (req, res) => {
    const { id } = req.params;
    const numId = parseInt(id, 10);
    const deleteInvest = await prisma.mockInvestor.findUnique({
      where: {
        id: numId,
      },
    });
    if (!deleteInvest) {
      return res.status(404).send({ message: "투자가 존재하지 않습니다" });
    }
    await prisma.mockInvestor.delete({ where: { id: numId } });
    return res.status(200).send({ message: "게시글이 삭제 되었습니다" });
  });

// 프론트랑 겹치니깐 8000으로 바꾼다.
const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`Server Started :${port}`));
