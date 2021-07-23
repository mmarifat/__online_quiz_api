import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CategoryDocument,
  CategoryEntity,
} from '../package/schemas/quiz/category.schema';
import {
  QuestionDocument,
  QuestionEntity,
} from '../package/schemas/quiz/question.schema';
import * as https from 'https';
import * as fs from 'fs';
import { seederUserID } from '../seeder/json/user.json';

interface fetchResultInterface {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

interface fetchDataInterface {
  response_code: number;
  results: Array<fetchResultInterface>;
}

@Injectable()
export class FakerService {
  private readonly logger = new Logger(FakerService.name);

  constructor(
    @InjectModel(CategoryEntity.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(QuestionEntity.name)
    private readonly questionModel: Model<QuestionDocument>,
  ) {}

  async initialize(): Promise<boolean> {
    const qc = await this.count();
    if (qc < 1) {
      const questions: fetchResultInterface[] = JSON.parse(
        fs.readFileSync('./src/faker/json/questions.json', 'utf8'),
      );

      if (!questions || questions?.length < 1) {
        this.logger.log(
          'Generating random question with categories..............',
        );
        await this.getRandomQuestions();
      }
      await this.generateQuestions(questions);
      this.logger.log('Question fake done...........................');
    } else this.logger.log('Question fake already done.................');
    return true;
  }

  getRandomQuestions = async (): Promise<boolean> => {
    const questions: fetchResultInterface[] = [];
    const amount = 50;

    for (let category = 1; category < 51; category++) {
      this.logger.log('Category = ' + category + '; Amount = ' + amount);
      const url = `https://opentdb.com/api.php?amount=${amount}&category=${category}`;

      https
        .get(url, (res) => {
          let response = '';
          res.on('data', (chunk) => {
            response += chunk;
          });
          res.on('end', async () => {
            const data: fetchDataInterface = JSON.parse(response);
            questions.push(...data.results);
            fs.writeFile(
              './src/faker/json/questions.json',
              JSON.stringify(questions, null, 4),
              function (err) {
                if (err) throw err;
              },
            );
          });
        })
        .on('error', (err) => {
          this.logger.error(err.message);
        });
    }
    return true;
  };

  generateQuestions = async (
    questions: fetchResultInterface[],
  ): Promise<boolean> => {
    if (questions.length) {
      for (const question of questions) {
        const q = new QuestionEntity();
        q.question = question.question.trim();
        q.correct = question.correct_answer.trim();

        // shuffling using Schwartzian transform
        q.options = [...question.incorrect_answers, question.correct_answer]
          .map((v) => ({
            v,
            sort: Math.random(),
          }))
          .sort((x, y) => x.sort - y.sort)
          .map(({ v }) => v.trim());

        q.createdBy = seederUserID as any;
        q.updatedBy = seederUserID as any;
        q.createdAt = new Date();
        q.updatedAt = new Date();

        const upsertCategory = await this.generateCategory(question.category);
        q.category = upsertCategory['_id'];

        await this.questionModel.create(q);
      }
    }
    return true;
  };

  generateCategory = async (category: string): Promise<CategoryEntity> => {
    const c = new CategoryEntity();
    c.name = category.trim();

    c.createdBy = seederUserID as any;
    c.updatedBy = seederUserID as any;
    c.createdAt = new Date();
    c.updatedAt = new Date();

    return this.categoryModel.findOneAndUpdate(
      {
        name: c.name,
      },
      { ...c },
      { upsert: true, new: true },
    );
  };

  count = async (): Promise<number> => {
    return this.questionModel.estimatedDocumentCount();
  };
}
