import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { number } from 'superstruct';
// import { CreateUser, PatchUser } from './structs.js';
// import { assert } from 'superstruct';

const prisma = new PrismaClient();

const app = express();
app.use(express.json());

// function asyncHandler(handler) {
//   return async function (req, res) {
//     try {
//       await handler(req, res);
//     } catch (e) {
//       if (e.name === 'StructError' ||
//         e instanceof Prisma.PrismaClientValidationError
//       ) {
//         res.status(400).send({ message: e.message });
//       } else if (
//         e instanceof Prisma.PrismaClientKnownRequestError &&
//         e.code === 'P2025'
//       ) {
//         res.sendStatus(404);
//       } else {
//         res.status(500).send({ message: e.message });
//       }
//     }
//   };
// }

// BigInt 값을 문자열로 변환하여 JSON 응답 생성
function replacer(key, value) {
  return typeof value === 'bigint' ? value.toString() : value;
}

app.get('/startups', async (req, res) => {
  const { offset = 0, limit = 10, order = 'id' } = req.query;
  let orderBy;
  switch (order) {
    case 'id':
      orderBy = { id: 'asc' };
      break;
  }
  try {
    const startups = await prisma.startup.findMany({
      orderBy,
      skip: parseInt(offset),
      take: parseInt(limit),
      inclued: {category: true},
    }); // BigInt 값을 문자열로 변환하여 JSON 응답 생성 
    const serializedStartups = JSON.stringify(startups, replacer); res.send(serializedStartups);
    
  } catch (error) { res.status(500).send({ message: error.message }); }
});

//특정 기업 상세 조회
app.get("/startups/:id", async (req, res) => {
  const {id} = req.params;
  const numId = parseInt(id, 10);
  try {
    const startup = await prisma.startup.findUnique({
      where: { id: numId },
    });
    const serializedStartups = JSON.stringify(startup, replacer); res.send(serializedStartups);
  }catch(error) {res.status(404).send({message: error.message}); }
});

//검색 기능
app.get("/startups/search", async (req, res) => {
  const { searchKeyword, offset = 0, limit = 10} =req.query;
  try {
    const startup = await prisma.startup.find({
      skip: parseInt(offset),
      take: parseInt(limit),
      where:{
        name: {contains: searchKeyword},
      },
    });
    const serializedStartups = JSON.stringify(startup, replacer); res.send(serializedStartups);
  }catch(error){res.status(404).send({message: error.message}); }
})

//기업 선택 횟수 조회
app.get('/selection', async (req, res) => {
  const { offset = 0, limit = 10 } = req.query;
  try{
    const select = await prisma.startup.findMany({
      skip: parseInt(offset),
      take: parseInt(limit),
      orderBy: {id: "asc"},
      select: {
        name:true, 
        count:true,
      },
    });
    res.status(200).send(select);
  } catch(error) {res.status(400).send({message:error.message});}
})

//특정 기업에 투자
app.post("/investments", async(req, res) => {
  try{
    const createInvest = await prisma.mockInvestor.create({
      data: req.body
    });
    res.status(200).send(createInvest);
  }catch(error) {res.status(400).send({message: error.message}); }
})

//투자 수정
app.patch("/investments/:id", async(req, res) => {
  const {id} = req.params;
  const numId = parseInt(id, 10);
  try{
    const updateInvest = await prisma.mockInvestor.update({
      date:{
        name,
        investAmount,
        comment, 
        password,
      },
      where: {
        id: numId,
      },
    });
    const serializedStartups = JSON.stringify(updateInvest, replacer); res.send(serializedStartups);
  }catch(error){res.status(404).send({message: error.message}); }
})

  //투자 삭제
  app.delete("/investments/:id", async(req,res) => {
    const {id} = req.params;
    const numId = parseInt(id, 10);
      const deleteInvest = await prisma.mockInvestor.findUnique({
        where: {
          id: numId
        },
      });
      if(!deleteInvest){
        return res.status(404).message({message: "투자가 존재하지 않습니다"});
      }if(deleteInvest.password !== password){
        return res.status(401).send({message: "비밀번호가 일치하지 않습니다"});
      }
      await prisma.mockInvestor.delete({where: {id: numId}});
      return res.status(200).send({message: "게시글이 삭제 되었습니다"});
  })



// 프론트랑 겹치니깐 8000으로 바꾼다.
const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`Server Started :${port}`));
