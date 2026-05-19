# Логотипы клиентов

Положите сюда файлы `client-1.png`, `client-2.png` и т.д. (прозрачный PNG или SVG).

На главной в блоке «Нам доверяют» замените текстовый `<span class="trust-logo">` на:

```html
<img class="trust-logo trust-logo--img" src="img/clients/client-1.png" alt="Название компании" width="120" height="40" loading="lazy" decoding="async">
```

Класс `trust-logo--img` даёт монохромный вид (filter в CSS).
