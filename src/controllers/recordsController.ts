import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

const uri =
  "mongodb://localhost:27017/dataset";
const client = new MongoClient(uri);


class RecordsController {
  async getSomeRecords(req: Request, res: Response): Promise<Response> {
    const numRecords: number = parseInt(req.query.num as string);
    let emotions;
    try {
      await client.connect();
      const database = client.db('dataset');
      const collection = database.collection('emotions');
      emotions = await collection.find().limit(numRecords).toArray();
      console.log(emotions);
    } catch (error) {
      console.error(error);
    } finally {
      await client.close();
    }
    return res.json(emotions);
  }


  async getRecordsWithVaryEmo(req: Request, res: Response): Promise<Response> {
    const min_count_vary_emo: number = parseInt(req.query.min_count_vary_emo as string);
    const max_count_vary_emo: number = parseInt(req.query.max_count_vary_emo as string);
    const numRecords: number = parseInt(req.query.num as string);
    const emotions = req.body.emotions;
    let result;
    try {
      await client.connect();
      const db = client.db('dataset');
      const collection = db.collection('emotions');

      const pipeline = [];

      if (emotions && emotions.length > 0 && emotions[0] !== '') {
        // Фильтрация по параметру emotions, только если массив не пустой
        pipeline.push({ $match: { emotion_id: { $in: emotions } } });
      }

      pipeline.push(
        {
          $match: {
            emotion_id: { $exists: true }
          }
        },
        {
          $group: {
            _id: "$text",
            emotions: { $addToSet: "$emotion_id" },
            count: { $sum: 1 },
            ids: { $addToSet: "$_id" }
          }
        },
        {
          $project: {
            _id: 1,
            emotions: 1,
            count: 1,
            ids: 1,
            numDistinctEmotions: { $size: "$emotions" }
          }
        },
        {
          $match: {
            $and: [
              { numDistinctEmotions: { $gte: min_count_vary_emo } }, // Минимальное количество эмоций
              { numDistinctEmotions: { $lte: max_count_vary_emo } } // Максимальное количество эмоций
            ]
          }
        }
      );

      result = await collection.aggregate(pipeline).limit(numRecords).toArray();
      console.log(result);
    } catch (error) {
      console.error(error);
    } finally {
      await client.close();
    }
    return res.json(result);
  }



}

export default new RecordsController();
