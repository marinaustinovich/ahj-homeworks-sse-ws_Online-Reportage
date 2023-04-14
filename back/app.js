const cors = require('@koa/cors');
const serve = require('koa-static');
const Koa = require('koa');
const { koaBody  } = require('koa-body');
const Router = require('koa-router');
const router = new Router();
const { streamEvents } = require('http-event-stream');
const fs = require('fs');
const path = require('path');

const app = new Koa();

app.use(cors());
app.use(koaBody ({
  multipart: true,
  urlencoded: true,
  formidable: {
    uploadDir: './public/uploads', // директория для сохранения загруженных файлов
    keepExtensions: true,    // сохранять расширения файлов
  }
}));

app.use(async (ctx, next) => { // проверка работы static
  console.log('Request URL:', ctx.request.url);
  await next();
});

app.use(serve(path.join(__dirname, 'public'))); // предоставлять статические файлы из папки 'uploads'

router.get('/', async (ctx) => {
  ctx.body = 'Welcome to server!';
});

router.get('/sse', async (ctx) => {
  const eventsCache = [];
  let id = 0;
  streamEvents(ctx.req, ctx.res, {
    async fetch(lastEventId) {
      console.log(lastEventId);
      const lastEventIndex = eventsCache.findIndex(event => event.id === lastEventId);
      // Если клиент подключается впервые, отправляем все события из кеша
      if (lastEventIndex === -1) {
        return eventsCache;
      } else {
        // Иначе отправляем только новые события
        return eventsCache.slice(lastEventIndex + 1);
      }
    },
    stream(sse) {
      let counter = 0;
      const intervalId = setInterval(() => {
        const events = [
          {type: 'action', message: 'Идёт перемещение мяча по полю, игроки и той, и другой команды активно пытаются атаковать'},
          {type: 'freekick', message: 'Нарушение правил, будет штрафной удар'},
          {type: 'goal', message: 'Отличный удар! И Г-О-Л!'}
        ];

        // Функция для генерации случайного события
        function generateEvent() {
          const random = Math.random();
          if (random < 0.5) { // 50% вероятность для первого события
            return 0;
          } else if (random < 0.9) { // 40% вероятность для первого события
            return 1;
          } else { // 10% вероятность для первого события
            return 2;
          }
        }
        const eventIndex = generateEvent();
        const event = events[eventIndex];
        id += 1;
        event.id = id;
        event.time = new Date(); // Генерация времени события
        eventsCache.push(event);
        sse.sendEvent({
          data: JSON.stringify(event),
          id: id,
        });
        counter++;
        if (counter >= 50) {
          clearInterval(intervalId);
          ctx.res.end();
        }
      }, Math.floor(Math.random() * (10000 - 3000 + 1)) + 3000); // генерируем интервал от 3 до 10 секунд

      return () => {};
    }
  });
  ctx.respond = false; // koa не будет обрабатывать ответ
});

app.use(router.routes());
app.use(router.allowedMethods());

const port = 7070;
app.listen(port, function(){
  console.log('Server running on http://localhost:7070')
});
