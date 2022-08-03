import path from 'path';
import morgan from 'morgan';
import Express from 'express';
import i18n from 'i18n';
import cors from 'cors';
import compression from 'compression';
import bodyParser from 'body-parser';
import swaggerUI from 'swagger-ui-express';
import {CORS_OPTIONS} from '../config';
import swaggerSpecV1 from './v1/docs';
import errorHandler from './errorHandler';
import routeV1 from './v1/v1';
import {DEFAULT_LANGUAGE, MORGAN_FORMAT} from '../constants';
import ResponseHandler from '../../external/middleware/response';

const app = new Express();
if (['development', 'local'].indexOf(process.env.NODE_ENV) !== -1) {
  app.use(morgan(MORGAN_FORMAT, {
    skip: (req, res) => {
      if (req.originalUrl.includes('api-docs')) {
        return true;
      }
      return res.statusCode < 400;
    },
    stream: process.stderr,
  }));
  app.use(morgan(MORGAN_FORMAT, {
    skip: (req, res) => {
      if (req.originalUrl.includes('api-docs')) {
        return true;
      }
      return res.statusCode >= 400;
    },
    stream: process.stdout,
  }));
} else {
  app.use(morgan(MORGAN_FORMAT, {
    skip: (req, res) => res.statusCode < 400,
    stream: process.stderr,
  }));
  app.use(morgan(MORGAN_FORMAT, {
    skip: (req, res) => res.statusCode >= 400,
    stream: process.stdout,
  }));
}
// Note: All request handle use CORS must be write bellow CORS settings
app.use(cors(CORS_OPTIONS));
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local') {
  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpecV1));
  app.use('/uploads', Express.static(path.resolve(__dirname, '../../uploads')));
}
app.use(compression());
app.use(bodyParser.json({limit: '20mb'}));
app.use(bodyParser.urlencoded({limit: '20mb', extended: false}));

// Multi Languages
i18n.configure({
  locales: ['en', 'vi'],
  directory: path.resolve(__dirname, '../../locales'),
  updateFiles: false,
  defaultLocale: DEFAULT_LANGUAGE,
});
app.use(i18n.init);
app.use((req, res, next) => {
  const language = req.header('Content-Language');
  req.lang = language || DEFAULT_LANGUAGE;
  next();
});
// TODO Handle Response
app.use((req, res, next) => {
  res.RH = new ResponseHandler(res);
  next();
});

app.use('/v1', routeV1);
app.get('/ping', (req, res) => res.json({
  success: true,
  message: 'pong'
}));

app.use(errorHandler);

export default app;
