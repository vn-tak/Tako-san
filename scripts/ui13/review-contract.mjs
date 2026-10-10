// Covers a complete 24-record draft even when JSON escapes every allowed character.
export const REVIEW_MAX_DRAFT_BYTES = 3 * 1024 * 1024;

export const REVIEW_FIELDS = [
  'recipeId',
  'decision',
  'candidateAssetId',
  'creator',
  'source',
  'rights',
  'subjectNotes',
  'cropNotes',
  'reviewer',
  'reviewedAt',
  'notes',
];
export const REVIEW_DECISIONS = ['pending', 'candidate', 'rejected', 'owner_reviewed'];

export function createReviewDraft(dataset) {
  return {
    schemaVersion: 1,
    kind: 'takosan_local_media_review',
    datasetId: dataset.datasetId,
    promotionAuthorized: false,
    records: dataset.recipes.map(({ recipeId }) => ({
      recipeId,
      decision: 'pending',
      candidateAssetId: null,
      creator: '',
      source: '',
      rights: '',
      subjectNotes: '',
      cropNotes: '',
      reviewer: '',
      reviewedAt: '',
      notes: '',
    })),
  };
}

export function validateReviewDataset(dataset) {
  const issues = [];
  if (!dataset || dataset.schemaVersion !== 1 || !/^[a-f0-9]{64}$/.test(dataset.datasetId ?? ''))
    issues.push('Dataset identity is invalid');
  if (
    !Array.isArray(dataset?.recipes) ||
    dataset.recipes.length !== 24 ||
    !Array.isArray(dataset?.assets) ||
    dataset.assets.length !== 8
  )
    return [...issues, 'Expected 24 recipes and 8 local assets'];
  for (const [name, rows, field] of [
    ['recipe', dataset.recipes, 'recipeId'],
    ['asset', dataset.assets, 'assetId'],
  ]) {
    const ids = rows.map((row) => row?.[field]);
    if (
      ids.some((id) => typeof id !== 'string' || !/^[a-z0-9-]+$/.test(id)) ||
      new Set(ids).size !== ids.length
    )
      issues.push(`Invalid or duplicate ${name} ID`);
  }
  for (const asset of dataset.assets) {
    const path = asset.path;
    if (
      typeof path !== 'string' ||
      !/^public\/frigo\/[a-z0-9_/-]+\.(png|webp)$/.test(path) ||
      path.split('/').some((part) => !part || part === '.' || part === '..')
    )
      issues.push('Unsafe local asset path');
    if (asset.url !== '/' + (typeof path === 'string' ? path.slice(7) : ''))
      issues.push('Asset URL does not match local path');
    if (
      !/^[a-f0-9]{64}$/.test(asset.sha256 ?? '') ||
      !Number.isInteger(asset.bytes) ||
      asset.bytes <= 0 ||
      !Number.isInteger(asset.width) ||
      asset.width <= 0 ||
      !Number.isInteger(asset.height) ||
      asset.height <= 0
    )
      issues.push('Invalid asset integrity metadata');
    if (asset.rightsStatus !== 'unknown') issues.push('Initial asset rights must remain unknown');
  }
  const assets = new Set(dataset.assets.map((asset) => asset.assetId));
  const slugs = new Set();
  for (const recipe of dataset.recipes) {
    if (
      typeof recipe.title !== 'string' ||
      !recipe.title.trim() ||
      typeof recipe.description !== 'string' ||
      typeof recipe.subjectBrief !== 'string' ||
      !recipe.subjectBrief.trim() ||
      !/^[a-z0-9-]+$/.test(recipe.slug ?? '') ||
      slugs.has(recipe.slug)
    )
      issues.push('Invalid recipe content or duplicate slug');
    slugs.add(recipe.slug);
    if (recipe.current?.assetId !== null && !assets.has(recipe.current?.assetId))
      issues.push('Unknown current asset reference');
    if (!['placeholder', 'legacy_static'].includes(recipe.current?.source))
      issues.push('Unreviewed remote/canonical preview is not allowed in this local board');
    if ((recipe.current?.source === 'placeholder') !== (recipe.current?.assetId === null))
      issues.push('Resolver output and current asset disagree');
  }
  return issues;
}

export function validateReviewDraft(value, dataset) {
  const issues = [];
  const add = (recipeId, field, message) => issues.push({ recipeId, field, message });
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return [{ recipeId: null, field: 'file', message: 'Bản nháp phải là một đối tượng JSON.' }];
  const rootFields = ['schemaVersion', 'kind', 'datasetId', 'promotionAuthorized', 'records'];
  if (Object.keys(value).some((key) => !rootFields.includes(key)))
    add(null, 'file', 'Bản nháp có trường không được hỗ trợ.');
  if (
    value.schemaVersion !== 1 ||
    value.kind !== 'takosan_local_media_review' ||
    value.datasetId !== dataset.datasetId ||
    value.promotionAuthorized !== false
  )
    add(
      null,
      'file',
      'Bản nháp không thuộc bộ dữ liệu này hoặc khai báo quyền xuất bản không hợp lệ.',
    );
  if (!Array.isArray(value.records))
    return [
      ...issues,
      { recipeId: null, field: 'file', message: 'Thiếu danh sách món cần duyệt.' },
    ];
  const expected = new Set(dataset.recipes.map((recipe) => recipe.recipeId));
  const assets = new Set(dataset.assets.map((asset) => asset.assetId));
  const seen = new Set();
  for (const record of value.records) {
    if (!record || typeof record !== 'object' || Array.isArray(record)) {
      add(null, 'file', 'Bản ghi món không hợp lệ.');
      continue;
    }
    const id = record.recipeId;
    if (!expected.has(id) || seen.has(id))
      add(null, 'file', 'Mã món bị trùng hoặc không thuộc bộ dữ liệu.');
    seen.add(id);
    if (
      REVIEW_FIELDS.some((key) => !Object.hasOwn(record, key)) ||
      Object.keys(record).some((key) => !REVIEW_FIELDS.includes(key))
    )
      add(id, 'file', 'Bản ghi thiếu trường hoặc chứa trường không được hỗ trợ.');
    if (!REVIEW_DECISIONS.includes(record.decision))
      add(id, 'decision', 'Trạng thái duyệt không hợp lệ.');
    if (record.candidateAssetId !== null && !assets.has(record.candidateAssetId))
      add(id, 'candidateAssetId', 'Chỉ chọn ảnh từ tám asset local của bộ này.');
    for (const field of REVIEW_FIELDS.filter(
      (key) => !['recipeId', 'decision', 'candidateAssetId'].includes(key),
    )) {
      if (typeof record[field] !== 'string' || record[field].length > 2000)
        add(id, field, 'Nội dung phải là chuỗi tối đa 2.000 ký tự.');
    }
    if (typeof record.reviewedAt === 'string' && record.reviewedAt) {
      const date = record.reviewedAt;
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        !Number.isFinite(Date.parse(date)) ||
        new Date(date).toISOString().slice(0, 10) !== date
      )
        add(id, 'reviewedAt', 'Ngày duyệt phải có thật, theo YYYY-MM-DD.');
    }
    if (record.decision === 'candidate' || record.decision === 'owner_reviewed') {
      if (!assets.has(record.candidateAssetId))
        add(id, 'candidateAssetId', 'Cần chọn ảnh đề xuất.');
    }
    if (
      record.decision === 'rejected' &&
      (typeof record.notes !== 'string' || !record.notes.trim())
    )
      add(id, 'notes', 'Ghi lý do loại khỏi vòng chọn.');
    if (record.decision === 'owner_reviewed') {
      for (const field of [
        'creator',
        'source',
        'rights',
        'subjectNotes',
        'cropNotes',
        'reviewer',
        'reviewedAt',
      ]) {
        if (typeof record[field] !== 'string' || !record[field].trim())
          add(id, field, 'Cần biên bản nguồn, quyền sử dụng, đúng món, crop và người/ngày duyệt.');
      }
    }
  }
  if (
    seen.size !== expected.size ||
    [...expected].some((id) => !seen.has(id)) ||
    value.records.length !== expected.size
  )
    add(null, 'file', 'Bản nháp phải có đầy đủ 24 món, mỗi món đúng một lần.');
  return issues;
}
