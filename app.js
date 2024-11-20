import * as dotenv from 'dotenv';
import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { CreateInvest, PatchInvest } from './structs.js';
import cors from 'cors';
import { assert } from 'superstruct';

dotenv.config();

const prisma = new PrismaClient();

const app = express();
app.use(express.json());

const express = require('express');
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3000',
}));
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

app.get('/startups/comparison', async (req, res) => {
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
    }); // BigInt 값을 문자열로 변환하여 JSON 응답 생성 
    const serializedStartups = JSON.stringify(startups, replacer); res.send(serializedStartups);
    
  } catch (error) { res.status(500).send({ message: error.message }); }
});

//검색 기능
app.get("/startups", async (req, res) => {
  const {searchKeyword ,offset = 0, limit=10} =req.query;
  try{
    const startup = await prisma.startup.findMany({
      where: {
        name: {contains:searchKeyword},
      },
      skip: parseInt(offset),
      take: parseInt(limit),
    })
    const serializedStartups = JSON.stringify(startup, replacer); res.send(serializedStartups);
  }catch(error){ res. status(501).send({message: error.message});}
})

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

//전체 투자 현황 조회
app.get("/investments", async(req, res) => {
  const {offset = 0, limit =10} =req.query;
  try{
    const invest = await prisma.mockInvestor.findMany({
      orderBy: {id: "asc"},
      skip: parseInt(offset),
      take:parseInt(limit),
    });
    const serializedInvest = JSON.stringify(invest, replacer); res.send(serializedInvest);
  }catch(error) {res.status(401).send({message:error.message});}
})

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
app.post("/investments", async(req, res) => {
  assert(req.body, CreateInvest);
  try{
    const createdInvest = await prisma.mockInvestor.create({
      data: req.body
    });
    
    res.status(201).send(createdInvest);
  }catch(error) {res.status(400).send({message: error.message}); }
})

//투자 수정
app.patch("/investments/:id", async(req, res) => {
  const {id} = req.params;
  const numId = parseInt(id, 10);
  assert (req.body, PatchInvest)
  try{
    const updateInvest = await prisma.mockInvestor.update({
      date: req.body,
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
        return res.status(404).send({message: "투자가 존재하지 않습니다"});
      }
      await prisma.mockInvestor.delete({where: {id: numId}});
      return res.status(200).send({message: "게시글이 삭제 되었습니다"});
  })

// 프론트랑 겹치니깐 8000으로 바꾼다.
const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`Server Started :${port}`));
