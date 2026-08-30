(function () {
  const logEl = document.getElementById('log');
  const nameEl = document.getElementById('agent-name');
  const statusEl = document.getElementById('agent-status');
  const queueCol = document.querySelector('.col-wait article');
  const meta = {
    cpo: { title: 'CPO Agent', status: 'координация штаба', cluster: 'PM Штаб' },
    osint: { title: 'OSINT', status: 'сбор открытых источников', cluster: 'OSINT' },
    neuro: { title: 'Нейропсихолог', status: 'рамка и тон аудитории', cluster: 'Инженеры масс' },
    trick: { title: 'Трикстер (взрывной PR)', status: 'черновик повестки, ждёт апрув', cluster: 'Хакеры инфополя' },
    show: { title: 'Шоураннер', status: 'сборка дуги', cluster: 'Инженеры масс' }
  };
  function log(line) {
    const t = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    logEl.textContent = '[' + t + '] ' + line + '\n' + logEl.textContent;
  }
  const tones = ['холод', 'сухо', 'нейтраль', 'тепло', 'удар'];
  document.getElementById('prov').addEventListener('input', function (e) {
    document.getElementById('v-prov').textContent = e.target.value;
  });
  document.getElementById('tone').addEventListener('input', function (e) {
    document.getElementById('v-tone').textContent = tones[Math.min(4, Math.floor(e.target.value / 21))];
  });
  document.getElementById('execute').addEventListener('click', function () {
    const prov = document.getElementById('prov').value;
    const tone = document.getElementById('v-tone').textContent;
    queueCol.textContent = 'Задача в pending_approval · провокация ' + prov + ' · тон ' + tone;
    log('EXECUTE: в очередь на апрув. В сеть не отправлено.');
  });
  if (typeof cytoscape === 'undefined') { log('ошибка: Cytoscape не загрузился'); return; }
  const cy = cytoscape({
    container: document.getElementById('cy'),
    elements: [
      { data: { id: 'cpo', label: 'CPO' } },
      { data: { id: 'osint', label: 'OSINT' } },
      { data: { id: 'neuro', label: 'Нейропсихолог' } },
      { data: { id: 'trick', label: 'Трикстер' } },
      { data: { id: 'show', label: 'Шоураннер' } },
      { data: { id: 'e1', source: 'osint', target: 'cpo' } },
      { data: { id: 'e2', source: 'cpo', target: 'neuro' } },
      { data: { id: 'e3', source: 'cpo', target: 'trick' } },
      { data: { id: 'e4', source: 'neuro', target: 'show' } },
      { data: { id: 'e5', source: 'trick', target: 'show' } },
      { data: { id: 'e6', source: 'show', target: 'cpo' } }
    ],
    style: [
      { selector: 'node', style: { 'background-color': '#0a0a0a', 'border-width': 2, 'border-color': '#d91b1b', label: 'data(label)', color: '#e8e4dc', 'font-family': 'Oswald, sans-serif', 'font-size': 11, 'text-valign': 'bottom', 'text-margin-y': 8, width: 28, height: 28 } },
      { selector: 'node:selected', style: { 'background-color': '#d91b1b', 'border-color': '#ffffff' } },
      { selector: 'edge', style: { width: 1.4, 'line-color': '#5a1a1a', 'target-arrow-color': '#d91b1b', 'target-arrow-shape': 'triangle', 'curve-style': 'bezier', 'arrow-scale': 0.8 } }
    ],
    layout: { name: 'cose', animate: false, padding: 30 },
    userZoomingEnabled: true,
    userPanningEnabled: true
  });
  cy.on('tap', 'node', function (evt) {
    const m = meta[evt.target.id()];
    if (!m) return;
    nameEl.textContent = m.title;
    statusEl.textContent = 'Кластер: ' + m.cluster + ' · ' + m.status;
    log('узел ' + m.title + ' · ' + m.status);
  });
  log('радар поднят · 5 узлов');
})();
