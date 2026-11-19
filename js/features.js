
'use strict';
(() => {
  const items = window.TECH_PRODUCTS || [];
  const nested = location.pathname.includes('/pages/');
  const prefix = nested ? '../' : '';
  const rub = n => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem('tl-'+key)) ?? fallback; } catch { return fallback; } };
  const save = (key, val) => { try { localStorage.setItem('tl-'+key, JSON.stringify(val)); } catch {} };
  let favorites = read('favorites', []);
  let compared = read('compare', []);
  let profile = read('profile', {name:'', email:''});
  const find = id => items.find(p => p.id === id);
  const safe = s => String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // Controls live where they belong: header, catalog toolbar, and chat corner.
  const header = document.querySelector('.site-header__inner');
  if (header) {
    const headerTools = document.createElement('div');
    headerTools.className = 'header-feature-tools';
    headerTools.innerHTML = `<button type="button" data-feature="favorites" aria-label="Избранное">♡ Избранное <span id="favorite-count">0</span></button><button type="button" data-feature="account">Личный кабинет</button>`;
    const orderAction = header.querySelector('.site-header__action');
    if (orderAction) orderAction.insertAdjacentElement('afterend', headerTools);
    else header.append(headerTools);
  }
  const chatButton = document.createElement('button');
  chatButton.type = 'button';
  chatButton.className = 'chat-launcher';
  chatButton.dataset.feature = 'chat';
  chatButton.setAttribute('aria-label', 'Открыть чат-помощник');
  chatButton.title = 'Чат-помощник';
  chatButton.textContent = '👤';
  document.body.append(chatButton);
  const catalogToolbar = document.querySelector('.catalog-results__top');
  if (catalogToolbar) {
    const compareButton = document.createElement('button');
    compareButton.type = 'button';
    compareButton.className = 'catalog-compare-button';
    compareButton.dataset.feature = 'compare';
    compareButton.innerHTML = `Сравнение <span id="compare-count">0</span>`;
    catalogToolbar.append(compareButton);
  }
  const panel = document.createElement('dialog');
  panel.className = 'feature-dialog';
  panel.setAttribute('aria-label','Инструменты покупателя');
  panel.innerHTML = `<div class="feature-dialog__head"><h2 id="feature-title">Инструменты</h2><button type="button" class="feature-dialog__close" aria-label="Закрыть">×</button></div><div id="feature-content"></div>`;
  document.body.append(panel);
  const content = panel.querySelector('#feature-content');
  panel.querySelector('.feature-dialog__close').addEventListener('click',()=>panel.close());
  panel.addEventListener('click', e=>{if(e.target===panel)panel.close();});
  const counts = () => {
    document.querySelectorAll('#favorite-count').forEach(el => el.textContent = favorites.length);
    document.querySelectorAll('#compare-count').forEach(el => el.textContent = compared.length);
    document.querySelectorAll('[data-favorite-id]').forEach(b=>{
      const on=favorites.includes(b.dataset.favoriteId);
      b.textContent=on?'♥ В избранном':'♡ В избранное';
      b.setAttribute('aria-pressed',String(on));
    });
    document.querySelectorAll('[data-compare-id]').forEach(b=>{
      const on=compared.includes(b.dataset.compareId);
      b.textContent=on?'✓ В сравнении':'+ Сравнить';
      b.setAttribute('aria-pressed',String(on));
    });
  };
  const productRow = p => `<div class="feature-product"><img src="${prefix+p.image}" alt="${safe(p.title)}"><div><strong>${safe(p.title)}</strong><p>${safe(p.description)}</p><b>${rub(p.price)}</b></div></div>`;
  const options = items.map(p=>`<option value="${p.id}">${safe(p.title)}</option>`).join('');
  function render(type, selectedId = '') {
    const labels={calculator:'Калькулятор стоимости',chat:'Чат-помощник',account:'Личный кабинет',favorites:'Избранное',compare:'Сравнение товаров'};
    panel.querySelector('#feature-title').textContent=labels[type];
    if(type==='calculator') {
      content.innerHTML=`<p class="feature-muted">Рассчитайте ориентировочную стоимость товара с количеством, доставкой и скидкой.</p><form id="calc-form" class="feature-form"><label>Товар<select name="product">${items.map(p=>`<option value="${p.id}" ${p.id===selectedId ? "selected" : ""}>${safe(p.title)}</option>`).join("")}</select></label><label>Количество<input name="qty" type="number" min="1" max="99" value="1" required></label><label>Доставка<select name="delivery"><option value="0">Самовывоз — 0 ₽</option><option value="390">Курьер — 390 ₽</option><option value="690">Экспресс — 690 ₽</option></select></label><label>Скидка<select name="discount"><option value="0">Без скидки</option><option value="5">5%</option><option value="10">10%</option></select></label><button class="button button--primary" type="submit">Рассчитать</button></form><output id="calc-result" class="feature-result" aria-live="polite"></output>`;
      content.querySelector('form').addEventListener('submit',e=>{
        e.preventDefault();const f=e.currentTarget, p=find(f.elements.product.value),qty=Number(f.elements.qty.value), delivery=Number(f.elements.delivery.value),discount=Number(f.elements.discount.value);
        if(!p || !Number.isInteger(qty)||qty<1||qty>99)return;
        const subtotal=p.price*qty, reduction=Math.round(subtotal*discount/100);
        content.querySelector('output').textContent=`Товары: ${rub(subtotal)} · Скидка: −${rub(reduction)} · Доставка: ${rub(delivery)} · Итого: ${rub(subtotal-reduction+delivery)}. Расчёт ориентировочный.`;
      });
    } else if(type==='chat') {
      content.innerHTML=`<p class="feature-muted">Автоматический помощник ответит на типовые вопросы. Для связи с человеком используйте контакты магазина.</p><div class="chat-history" role="log" aria-live="polite"><p class="chat-bubble">Здравствуйте! Спросите про доставку, оплату, гарантию, каталог или контакты.</p></div><form id="chat-form" class="chat-form"><label class="visually-hidden" for="chat-input">Ваш вопрос</label><input id="chat-input" maxlength="250" required placeholder="Напишите вопрос…"><button class="button button--primary" type="submit">Отправить</button></form>`;
      content.querySelector('form').addEventListener('submit',e=>{
        e.preventDefault();const input=content.querySelector('#chat-input'),q=input.value.trim();if(!q)return;
        const history=content.querySelector('.chat-history');
        const add=(t,own)=>{const p=document.createElement('p');p.className='chat-bubble'+(own?' chat-bubble--own':'');p.textContent=t;history.append(p);};
        add(q,true);let answer='Я могу подсказать по доставке, оплате, гарантии и выбору товаров. Для индивидуального вопроса свяжитесь с нами через страницу «Контакты».';
        if(/достав|курьер|самовывоз/i.test(q))answer='В калькуляторе можно сравнить самовывоз и варианты доставки. Точные условия уточняйте по телефону.';
        else if(/оплат|карт|наличн/i.test(q))answer='Онлайн-оплата на сайте не подключена. Способ оплаты уточняется при обращении в магазин.';
        else if(/гарант|возврат/i.test(q))answer='Условия гарантии и возврата зависят от товара. Напишите нам или позвоните, чтобы уточнить детали.';
        else if(/цен|выбор|товар|каталог/i.test(q))answer='Посмотрите каталог: в карточках указаны цены и описания. Можно добавить товары в избранное или сравнение.';
        else if(/телефон|почт|адрес|контакт/i.test(q))answer='Телефон: +7 (961) 535-11-33. Почта: vladiworld2007@gmail.com. Адрес: Москва, улица Саларьево, 8.';
        add(answer,false);input.value='';history.scrollTop=history.scrollHeight;
      });
    } else if(type==='account') {
      content.innerHTML=`<p class="feature-muted">Данные профиля сохраняются только в этом браузере. Регистрация на сервере не требуется.</p><form id="profile-form" class="feature-form"><label>Имя<input name="name" maxlength="70" autocomplete="name" required value="${safe(profile.name)}"></label><label>Электронная почта<input name="email" type="email" autocomplete="email" required value="${safe(profile.email)}"></label><button class="button button--primary" type="submit">Сохранить профиль</button></form><p id="profile-status" class="feature-result" role="status"></p>`;
      content.querySelector('form').addEventListener('submit',e=>{e.preventDefault();profile={name:e.currentTarget.elements.name.value.trim(),email:e.currentTarget.elements.email.value.trim()};if(!profile.name)return;save('profile',profile);content.querySelector('#profile-status').textContent='Профиль сохранён в этом браузере.';});
    } else if(type==='favorites') {
      const chosen=favorites.map(find).filter(Boolean);
      content.innerHTML=chosen.length?chosen.map(p=>`${productRow(p)}<button class="feature-remove" data-remove-fav="${p.id}" type="button">Удалить из избранного</button>`).join(''):'<p class="feature-muted">Пока пусто. Добавляйте товары из каталога кнопкой ♡.</p>';
    } else if(type==='compare') {
      const chosen=compared.map(find).filter(Boolean);
      content.innerHTML=chosen.length?`<div class="compare-table-wrap"><table class="compare-table"><thead><tr><th>Товар</th><th>Цена</th><th>Описание</th><th></th></tr></thead><tbody>${chosen.map(p=>`<tr><th>${safe(p.title)}</th><td>${rub(p.price)}</td><td>${safe(p.description)}</td><td><button type="button" data-remove-compare="${p.id}">Убрать</button></td></tr>`).join('')}</tbody></table></div>`:'<p class="feature-muted">Добавьте два или более товара из каталога для сравнения.</p>';
    }
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-feature]');
    if(!b)return;
    const type=b.dataset.feature;
    const selectedId=b.dataset.productId || '';
    // When opening calculator from the order dialog, close that dialog first.
    const orderDialog=b.closest('dialog');
    if(orderDialog?.open) orderDialog.close();
    render(type, selectedId);
    panel.showModal();
  });
  content.addEventListener('click',e=>{
    const fav=e.target.closest('[data-remove-fav]'),cmp=e.target.closest('[data-remove-compare]');
    if(fav){favorites=favorites.filter(x=>x!==fav.dataset.removeFav);save('favorites',favorites);counts();render('favorites');}
    if(cmp){compared=compared.filter(x=>x!==cmp.dataset.removeCompare);save('compare',compared);counts();render('compare');}
  });
  document.querySelectorAll('.product-card').forEach(card=>{
    const title=card.querySelector('.product-card__title')?.textContent.trim();
    const p=items.find(item=>item.title===title);
    if(!p)return;
    const actions=document.createElement('div');actions.className='product-extra-actions';
    actions.innerHTML=`<button type="button" data-favorite-id="${p.id}"></button><button type="button" data-compare-id="${p.id}"></button>`;
    card.querySelector('.product-card__body')?.append(actions);
  });
  document.addEventListener('click',e=>{
    const fav=e.target.closest('[data-favorite-id]'),cmp=e.target.closest('[data-compare-id]');
    if(fav){const id=fav.dataset.favoriteId;favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];save('favorites',favorites);counts();}
    if(cmp){const id=cmp.dataset.compareId;compared=compared.includes(id)?compared.filter(x=>x!==id):[...compared,id];save('compare',compared);counts();}
  });
  counts();
})();
