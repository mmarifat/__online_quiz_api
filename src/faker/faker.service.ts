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
import { DeleteStatusEnum } from '../package/enum/delete-status.enum';
import {
  QuizTestDocument,
  QuizTestEntity,
} from '../package/schemas/quiz/quiz-test.schema';
import isNotDeletedQuery from '../package/queries/is-not-deleted.query';
import unsetAbstractFieldsAggregateQuery from '../package/queries/unset-abstract-fields.aggregate.query';
import aggregateToVirtualAggregateQuery from '../package/queries/aggregate-to-virtual.aggregate.query';
import CollectionEnum from '../package/enum/collection.enum';
import { SystemException } from '../package/exceptions/system.exception';
import * as faker from 'faker';

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
    @InjectModel(QuizTestEntity.name)
    private readonly quizTestModel: Model<QuizTestDocument>,
  ) {}

  categories: CategoryEntity[] = [];

  async initialize(): Promise<boolean> {
    await this.fakeQuestions();
    await this.fakeTests();
    return true;
  }

  /********* fake questions start *************/
  async fakeQuestions(): Promise<boolean> {
    this.logger.log('Faking questions...........................');
    const qc = await this.countQuestion();
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

  async getRandomQuestions(): Promise<boolean> {
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
  }

  async generateQuestions(questions: fetchResultInterface[]): Promise<boolean> {
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

        const found = this.categories.findIndex(
          (m) => m.name === upsertCategory.name,
        );
        if (found === -1) {
          this.categories.push(upsertCategory);
        }

        await this.questionModel.create(q);
      }
    }
    return true;
  }

  async generateCategory(category: string): Promise<CategoryEntity> {
    const c = new CategoryEntity();
    c.name = category.trim();

    c.isDeleted = DeleteStatusEnum.disabled;
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
  }

  async randomQuestionsFromDbByCategory(
    limit: number,
    category: string,
  ): Promise<QuestionEntity[]> {
    try {
      const total = await this.questionModel
        .aggregate([
          {
            $match: { ...isNotDeletedQuery, category },
          },
        ])
        .count('count')
        .exec();

      const pipeline: any[] = [
        {
          $match: { ...isNotDeletedQuery, category },
        },
        {
          $project: {
            correct: 0,
          },
        },
        ...unsetAbstractFieldsAggregateQuery,
        ...aggregateToVirtualAggregateQuery,
      ];

      if (total.length > 0 && total[0]?.count > 0) {
        pipeline.push({
          $skip: Math.random() * total[0].count,
        });
      }

      if (limit) {
        pipeline.push({
          $limit: Number(limit),
        });
      }

      pipeline.push({
        $lookup: {
          from: CollectionEnum.CATEGORY,
          let: { localID: '$category' },
          pipeline: [
            {
              $match: { $expr: { $eq: ['$_id', '$$localID'] } },
            },
            ...unsetAbstractFieldsAggregateQuery,
            ...aggregateToVirtualAggregateQuery,
          ],
          as: 'category',
        },
      });

      pipeline.push({
        $unwind: { path: '$category', preserveNullAndEmptyArrays: true },
      });

      return this.questionModel.aggregate(pipeline).exec();
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async countQuestion(): Promise<number> {
    return this.questionModel.estimatedDocumentCount();
  }
  /********* fake questions end  *************/

  /********* fake test start *************/

  async fakeTests(): Promise<boolean> {
    this.logger.log('Faking tests..............');
    const tc = await this.countTest();
    if (tc < 1) {
      await this.generateTests();
    }
    this.logger.log('Test fake done..............');
    return true;
  }

  async generateTests(): Promise<boolean> {
    const countQs: number = await this.countQuestion();

    for (const category of this.categories) {
      let cnt = 1;
      while (cnt < Math.floor((countQs + 1) / 2)) {
        const qz = new QuizTestEntity();
        qz.title = faker.name.title();
        qz.description = faker.lorem.paragraphs(2);
        qz.timeInMin = cnt % 2 === 0 ? 15 : 10;

        const questions = await this.randomQuestionsFromDbByCategory(
          cnt % 2 === 0 ? 15 : 10,
          category['_id'],
        );
        qz.questions = questions.map((m) => m['id']);
        qz.category = category['_id'];

        qz.createdBy = seederUserID as any;
        qz.updatedBy = seederUserID as any;
        qz.createdAt = new Date();
        qz.updatedAt = new Date();

        await this.quizTestModel.create(qz);

        cnt++;
      }
    }

    return true;
  }

  async countTest(): Promise<number> {
    return this.quizTestModel.estimatedDocumentCount();
  }
  /*********   fake test end  *************/
}
