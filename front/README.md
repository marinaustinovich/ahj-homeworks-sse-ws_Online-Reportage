## Онлайн-репортаж

### Легенда

Портал спортивных трансляций, на которых пользователи могут видеть текстовую трансляцию матча. Обновления получаются с сервера, но не отправлятся обратно, используется SSE для получения данных.

### Описание

Реализованы серверная часть и клиентская, позволяющие по SSE получать данные с прямого репортажа о футбольном событии.

#### Серверная часть

На серверной части генерируется с произвольным интервалом несколько типов событий:
1. Комментарий об игровом действии: «Идёт перемещение мяча по полю, игроки и той, и другой команды активно пытаются атаковать» (тип — `action`).
1. Штрафной удар: «Нарушение правил, будет штрафной удар» (тип — `freekick`).
1. Гол: «Отличный удар! И Г-О-Л!» (тип — `goal`).

Генерируйются события в случайном порядке с различной долей вероятности:
1. Вероятность первого события — 50 %.
1. Вероятность второго события — 40 %.
1. Вероятность третьего события — 10 %.

Игра стартует при старте сервера (генерация событий). Максимум сгенерированных событий — 50.

Все события должны кешируются. Так, чтобы игрок, подключившийся не с самого начала матча, получал всю предыдущую историю игры.

#### Клиентская часть

Клиентская часть должна выглядеть следующим образом:

![](./scr/image/report.png)

Обратите внимание: для событий с типом `freekick` и `goal` сбоку устанавливаются иконки.

Виджет в виде отдельного класса, который сам генерирует для себя разметку и которому в качестве параметра конструктора передаётся URL для подключения.
