(() => {
  const dataset = JSON.parse(document.getElementById('review-data').textContent);
  const byId = (id) => document.getElementById(id);
  const element = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  };
  const assetMap = new Map(dataset.assets.map((asset) => [asset.assetId, asset]));
  const decisions = {
    pending: 'Chờ duyệt',
    candidate: 'Cân nhắc ảnh',
    rejected: 'Loại khỏi vòng chọn',
    owner_reviewed: 'Có biên bản · chưa áp dụng',
  };
  const dialog = byId('review-dialog'),
    form = byId('review-form');
  let draft = createReviewDraft(dataset),
    activeRecipe = null,
    opener = null,
    dirty = false;
  const feedback = (text, error = false) => {
    byId('feedback').textContent = text;
    byId('feedback').dataset.error = String(error);
  };
  const normalize = (text) =>
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase();
  function picture(asset, title, variant = '') {
    if (!asset) {
      const missing = element('div', 'missing');
      missing.append(element('span', '', 'Chưa có ảnh món ăn phù hợp'));
      return missing;
    }
    const frame = element('div', `media ${variant}`),
      image = element('img');
    image.src = `../../../public${asset.url}`;
    image.alt = title;
    image.width = asset.width;
    image.height = asset.height;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.addEventListener(
      'error',
      () =>
        frame.replaceWith(
          element('div', 'missing', 'File ảnh local không tải được. Kiểm tra lại bản checkout.'),
        ),
      { once: true },
    );
    frame.append(image);
    return frame;
  }
  function syncURL() {
    const url = new URL(location.href);
    url.search = '';
    for (const [key, id] of [
      ['q', 'search'],
      ['policy', 'policy'],
      ['decision', 'decision-filter'],
    ]) {
      const value = byId(id).value;
      if (value && value !== 'all') url.searchParams.set(key, value);
    }
    if (activeRecipe) url.searchParams.set('recipe', activeRecipe.recipeId);
    // file: previews can restrict History writes; interactions still work without it.
    try {
      history.replaceState(null, '', url);
    } catch {
      /* URL state is best-effort on file: origins. */
    }
  }
  function renderRecipes() {
    const query = normalize(byId('search').value),
      policy = byId('policy').value,
      choice = byId('decision-filter').value;
    const reviews = new Map(draft.records.map((record) => [record.recipeId, record]));
    const rows = dataset.recipes.filter(
      (recipe) =>
        (!query ||
          normalize(`${recipe.title} ${recipe.recipeId} ${recipe.slug}`).includes(query)) &&
        (policy === 'all' ||
          (policy === 'photo' && recipe.current.assetId) ||
          (policy === 'missing' && !recipe.current.assetId) ||
          (policy === 'wrong' && recipe.legacyMappingIssue === 'wrong_dish_or_missing_file')) &&
        (choice === 'all' || reviews.get(recipe.recipeId).decision === choice),
    );
    const cards = rows.map((recipe) => {
      const review = reviews.get(recipe.recipeId),
        card = element('article', 'card');
      card.dataset.recipeId = recipe.recipeId;
      card.append(picture(assetMap.get(recipe.current.assetId), recipe.title));
      const body = element('div', 'card-body');
      body.append(
        element('p', 'meta', `${String(recipe.priority).padStart(2, '0')} / ${recipe.recipeId}`),
        element('h3', '', recipe.title),
        element('p', 'description', recipe.description),
      );
      body.append(
        element(
          'p',
          'badge' + (recipe.current.assetId ? '' : ' warn'),
          recipe.current.assetId
            ? 'Ảnh hiện có · chưa rõ quyền'
            : recipe.legacyMappingIssue === 'wrong_dish_or_missing_file'
              ? 'Mapping sai món / thiếu file'
              : 'Đang hiển thị thiếu ảnh',
        ),
      );
      body.append(
        element(
          'p',
          `badge ${review.decision === 'rejected' ? 'rejected' : ''}`,
          decisions[review.decision],
        ),
      );
      if (review.candidateAssetId)
        body.append(
          element(
            'p',
            'meta',
            `Đề xuất: ${assetMap.get(review.candidateAssetId).label} · chưa áp dụng`,
          ),
        );
      const button = element('button', '', 'Duyệt ảnh và crop');
      button.type = 'button';
      button.setAttribute('aria-label', `Duyệt ảnh: ${recipe.title}`);
      button.addEventListener('click', () => openReview(recipe, button));
      body.append(button);
      card.append(body);
      return card;
    });
    byId('recipe-grid').replaceChildren(...cards);
    byId('result-count').textContent = `${rows.length} / 24 món`;
    byId('empty').hidden = rows.length > 0;
    syncURL();
  }
  function renderAssets() {
    byId('asset-grid').replaceChildren(
      ...dataset.assets.map((asset) => {
        const card = element('article', 'card');
        card.append(picture(asset, `Ảnh gốc: ${asset.label}`));
        const body = element('div', 'card-body');
        body.append(
          element('h3', 'asset-name', asset.label),
          element('p', 'badge warn', 'Nguồn / quyền chưa xác nhận'),
        );
        const details = element('dl', 'asset-details');
        for (const [label, value] of [
          ['File gốc', asset.path],
          ['Kích thước', `${asset.width} × ${asset.height} px`],
          [
            'Dung lượng',
            `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(asset.bytes / 1024)} KB`,
          ],
          ['SHA256', asset.sha256],
        ])
          details.append(element('dt', '', label), element('dd', '', value));
        body.append(details);
        card.append(body);
        return card;
      }),
    );
  }
  function previewCandidate() {
    const asset = assetMap.get(byId('candidateAssetId').value),
      frames = [];
    if (asset) {
      for (const [name, variant] of [
        ['Thẻ món / chi tiết hiện tại · 4:3', ''],
        ['Hero rộng thử nghiệm · 16:9', 'hero'],
        ['Ảnh gốc · giữ nguyên khung', 'original'],
      ]) {
        const figure = element('figure');
        figure.append(
          picture(asset, `Ảnh đề xuất cho ${activeRecipe.title} · ${name}`, variant),
          element('figcaption', '', name),
        );
        frames.push(figure);
      }
    } else
      frames.push(
        element(
          'p',
          'dialog-copy',
          'Chọn ảnh local để so sánh ba khung. Nếu chưa có ảnh đúng món, giữ trạng thái chờ duyệt và ghi brief cần chụp.',
        ),
      );
    byId('candidate-previews').replaceChildren(...frames);
  }
  function clearErrors() {
    form.querySelectorAll('[aria-invalid]').forEach((el) => {
      el.removeAttribute('aria-invalid');
      el.removeAttribute('aria-describedby');
    });
    byId('form-error').textContent = '';
  }
  function openReview(recipe, button = null) {
    activeRecipe = recipe;
    opener = button;
    const review = draft.records.find((record) => record.recipeId === recipe.recipeId);
    byId('dialog-title').textContent = recipe.title;
    byId('dialog-context').textContent =
      `${recipe.recipeId} · ${recipe.current.assetId ? 'Ảnh local hiện có; chưa có biên bản quyền sử dụng' : 'Đang hiển thị thiếu ảnh'}`;
    byId('subject-brief').textContent = recipe.subjectBrief;
    const mappingDetails = [];
    for (const [label, value] of [
      ['Slug', recipe.slug],
      ['Mapping legacy', recipe.legacyUrl],
      ['Policy', recipe.legacyMappingIssue ?? 'allowed_legacy_mapping'],
      ['Ảnh hiện tại', recipe.current.url ?? 'HTML thiếu ảnh'],
    ])
      mappingDetails.push(element('dt', '', label), element('dd', '', value));
    byId('mapping-details').replaceChildren(...mappingDetails);
    byId('current-preview').replaceChildren(
      picture(assetMap.get(recipe.current.assetId), recipe.title),
    );
    for (const key of REVIEW_FIELDS.filter((key) => key !== 'recipeId'))
      byId(key).value = review[key] ?? '';
    clearErrors();
    previewCandidate();
    dialog.showModal();
    byId('close-dialog').focus();
    syncURL();
  }
  function closeReview() {
    dialog.close();
  }
  dialog.addEventListener('close', () => {
    const id = activeRecipe?.recipeId;
    activeRecipe = null;
    syncURL();
    const target = opener?.isConnected
      ? opener
      : document.querySelector(`[data-recipe-id="${id}"] button`);
    target?.focus();
    opener = null;
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('button,input,select,textarea,a[href]')].filter(
      (control) => !control.disabled && control.getClientRects().length,
    );
    const first = controls[0],
      last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  byId('close-dialog').addEventListener('click', closeReview);
  byId('cancel-review').addEventListener('click', closeReview);
  byId('candidateAssetId').addEventListener('change', previewCandidate);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearErrors();
    const review = { recipeId: activeRecipe.recipeId };
    for (const key of REVIEW_FIELDS.filter((key) => key !== 'recipeId'))
      review[key] = key === 'candidateAssetId' ? byId(key).value || null : byId(key).value;
    const candidate = {
        ...draft,
        records: draft.records.map((record) =>
          record.recipeId === review.recipeId ? review : record,
        ),
      },
      issues = validateReviewDraft(candidate, dataset);
    if (issues.length) {
      byId('form-error').textContent = issues[0].message;
      const input = byId(issues[0].field);
      if (input) {
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', 'form-error');
        input.focus();
      }
      return;
    }
    draft = candidate;
    ++importVersion;
    dirty = true;
    renderRecipes();
    feedback(
      `Đã giữ lựa chọn cho ${activeRecipe.title} trong bản nháp. Tải JSON để giữ ngoài phiên này.`,
    );
    closeReview();
  });
  const resetFilters = () => {
    byId('search').value = '';
    byId('policy').value = 'all';
    byId('decision-filter').value = 'all';
    renderRecipes();
    byId('search').focus();
  };
  byId('reset-filters').addEventListener('click', resetFilters);
  byId('empty-reset').addEventListener('click', resetFilters);
  for (const id of ['search', 'policy', 'decision-filter'])
    byId(id).addEventListener(id === 'search' ? 'input' : 'change', renderRecipes);
  byId('export-draft').addEventListener('click', () => {
    const issues = validateReviewDraft(draft, dataset);
    if (issues.length) {
      feedback(issues[0].message, true);
      return;
    }
    const blob = new Blob([JSON.stringify(draft, null, 2) + '\n'], { type: 'application/json' }),
      url = URL.createObjectURL(blob),
      link = element('a');
    link.href = url;
    link.download = 'takosan-media-review-draft.json';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    feedback('Đã tạo tệp JSON để tải. Kiểm tra tệp đã lưu trước khi rời phiên.');
  });
  let importVersion = 0;
  byId('import-file').addEventListener('change', async (event) => {
    const file = event.target.files[0],
      version = ++importVersion;
    if (!file) return;
    try {
      if (file.size > REVIEW_MAX_DRAFT_BYTES) throw new Error('Bản nháp vượt 3 MiB.');
      const candidate = JSON.parse(await file.text());
      if (version !== importVersion) return;
      const issues = validateReviewDraft(candidate, dataset);
      if (issues.length) throw new Error(issues[0].message);
      draft = candidate;
      dirty = false;
      renderRecipes();
      feedback('Đã nhập đủ 24 món. Các khai báo chưa cấp quyền áp dụng ảnh vào catalog.');
    } catch (error) {
      if (version === importVersion)
        feedback(`Không nhập bản nháp: ${error.message} Dữ liệu trong phiên vẫn giữ nguyên.`, true);
    } finally {
      if (version === importVersion) event.target.value = '';
    }
  });
  window.addEventListener('beforeunload', (event) => {
    if (dirty) {
      event.preventDefault();
      event.returnValue = '';
    }
  });
  window.addEventListener('popstate', () => {
    readURL();
    renderRecipes();
  });
  function readURL() {
    const url = new URL(location.href);
    byId('search').value = (url.searchParams.get('q') ?? '').slice(0, 160);
    for (const [key, id] of [
      ['policy', 'policy'],
      ['decision', 'decision-filter'],
    ]) {
      const value = url.searchParams.get(key) ?? 'all';
      byId(id).value = [...byId(id).options].some((option) => option.value === value)
        ? value
        : 'all';
    }
  }
  const requestedRecipe = new URL(location.href).searchParams.get('recipe');
  readURL();
  for (const asset of dataset.assets) {
    const option = element('option', '', `${asset.assetId} · ${asset.label}`);
    option.value = asset.assetId;
    byId('candidateAssetId').append(option);
  }
  renderRecipes();
  renderAssets();
  byId('dataset-label').textContent =
    `Bộ dữ liệu: ${dataset.datasetId} · chỉ dùng cho bản duyệt local`;
  if (requestedRecipe) {
    const recipe = dataset.recipes.find((recipe) => recipe.recipeId === requestedRecipe);
    if (recipe) openReview(recipe);
  }
})();
