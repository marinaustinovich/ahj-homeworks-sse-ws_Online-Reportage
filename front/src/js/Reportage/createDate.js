const dayjs = require('dayjs');

export default function createDate(time) {
  return dayjs(time).format('HH:mm:ss DD.MM.YY');
}
