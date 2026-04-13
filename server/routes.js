export function buildLaneHtml(title, items) {
  return `
    <section>
      <p class="eyebrow">${title}</p>
      <div class="lane-grid">
        ${items.map((item) => `
          <article class="lane-card">
            <h3>${item.title}</h3>
            <p>${item.description || item.notes || ''}</p>
            <small>Status: ${item.status || 'unknown'}</small>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}
