/* eslint-disable */
import dayjs from 'dayjs';

const FREEKICK = 'freekick';
const GOAL = 'goal';

const messageIcons = {
  [FREEKICK]: '&excl;&excl;',
  [GOAL]: '⚽',
};

export default class Reportage {
  constructor(url, container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('container is not HTMLElement');
    }

    this.container = container;
    this.url = url;
    this.lastMessageId = null;

    this.list = null;

    this.bindToDOM(container);
  }

  bindToDOM(container) {
    this.container = container;

    this.drawUi();
  }

  checkBinding() {
    if (!this.list) {
      throw new Error('Reportage not bind to DOM');
    }
  }

  drawUi() {
    this.container.innerHTML = `
      <header>
        <h1>Онлайн-репортаж о спорте</h1>
      </header>
      <main>
        <section class="chat-window">
          <div class="messages">
            <!-- Сообщения будут добавляться динамически -->
          </div>
        </section>
      </main>
    `;

    this.list = this.container.querySelector('.messages');
    this.events();
  }

  async events() {
    const eventSource = new EventSource(this.url);

    eventSource.addEventListener('message', async (e) => {
      try {
        const data = JSON.parse(e.data);

        this.lastMessageId = e.lastEventId;
        await this.addMessage(data);
      } catch (error) {
        console.error(error);
      }
    });

    eventSource.addEventListener('open', () => {
      console.log('connected');
    });

    eventSource.addEventListener('error', () => {
      console.log('error');
      this.fetchEvents(this.url);
    });
  }

  async addMessage(obj) {
    this.checkBinding();

    const message = document.createElement('div');
    message.classList.add('message');

    const type = document.createElement('div');
    type.classList.add('message-type');
    type.innerHTML = messageIcons[obj.type] || '';

    const content = document.createElement('div');
    content.classList.add('message-content');

    const time = document.createElement('div');
    time.classList.add('time');
    time.textContent = dayjs(obj.time).format('HH:mm:ss DD.MM.YY');

    const text = document.createElement('div');
    text.classList.add('text');
    text.textContent = obj.message;

    content.append(time, text);
    message.append(type, content);

    this.list.append(message);
  }

  async fetchEvents(url) {
    const response = await fetch(`${url}?lastEventId=${this.lastMessageId}`);
    const events = await response.json();
    events.forEach((event) => this.addMessage(event));
  }
}
