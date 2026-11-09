(function () {
    'use strict';

    /* =====================================================================
       1. CONSTANTES E CONFIGURAÇÃO
       ===================================================================== */
    const MAX_BLOCKS = 60;          // limite de seções no canvas
    const MAX_TEXT = 400;           // limite de caracteres por texto editável
    const MAX_ICONS_PER_SLOT = 8;   // limite de ícones em slots "multi"
    const STORAGE_KEY = 'visual-bootstrap:draft:v1';
    const BS_VERSION = '5.3.3';

    // Variantes de cor = paleta padrão do Bootstrap
    const ACCENTS = [
        ['primary', 'Primary'], ['secondary', 'Secondary'], ['success', 'Success'],
        ['danger', 'Danger'], ['warning', 'Warning'], ['info', 'Info'], ['dark', 'Dark']
    ];
    const ACCENT_IDS = ACCENTS.map(a => a[0]);
    // Classes utilitárias/componentes Bootstrap que carregam uma cor (ex.: btn-primary, text-bg-success, bg-info-subtle)
    const ACCENT_RE = /^(btn-outline|btn|text-bg|text|bg|border|link)-(primary|secondary|success|danger|warning|info|light|dark)(-subtle|-emphasis)?$/;

    // Elementos de texto que podem ser editados inline (apenas se contiverem só texto/<br>)
    const EDIT_SEL = 'h1,h2,h3,h4,h5,h6,p,li,a,small,label,blockquote,figcaption,th,td,.badge,cite';
    const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

    /* =====================================================================
       2. ÍCONES (SVG inline, sem imagens externas)
       ===================================================================== */
    const ICON_PATHS = {
        'cart': '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
        'bag': '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
        'user': '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
        'users': '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
        'search': '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
        'heart': '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
        'bell': '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
        'star': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
        'zap': '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
        'shield': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
        'globe': '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
        'mail': '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
        'phone': '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
        'check': '<polyline points="20 6 9 17 4 12"/>',
        'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
        'home': '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
        'sliders': '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
        'message': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
        'trending': '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
        'box': '<line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
        'clock': '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
        'lock': '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
        'facebook': '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
        'instagram': '<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>',
        'twitter': '<path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>',
        'linkedin': '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
        // ícones usados apenas pela interface do construtor
        'grip': '<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
        'arrow-up': '<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>',
        'arrow-down': '<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>',
        'copy': '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
        'trash': '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
        'layers': '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>'
    };

    // Ícones oferecidos ao usuário no seletor (rótulos em português)
    const ICON_LABELS = {
        'cart': 'Carrinho de compras', 'bag': 'Sacola', 'user': 'Usuário', 'users': 'Equipe', 'search': 'Busca',
        'heart': 'Favoritos', 'bell': 'Notificações', 'star': 'Estrela', 'zap': 'Raio', 'shield': 'Segurança',
        'globe': 'Mundo', 'mail': 'E-mail', 'phone': 'Telefone', 'check': 'Check', 'check-circle': 'Confirmado',
        'home': 'Início', 'sliders': 'Ajustes', 'message': 'Mensagem', 'trending': 'Crescimento', 'box': 'Pacote',
        'clock': 'Relógio', 'lock': 'Cadeado', 'facebook': 'Facebook', 'instagram': 'Instagram',
        'twitter': 'Twitter', 'linkedin': 'LinkedIn'
    };
    const PICKER_ICONS = Object.keys(ICON_LABELS);

    /** Retorna a marcação SVG de um ícone (string vazia se o nome não existir). */
    function icon(name) {
        const p = ICON_PATHS[name];
        if (!p) return '';
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + p + '<\/svg>';
    }

    /** Slot de ícone: elemento clicável no construtor. `multi` permite vários ícones. Atributos data-vb-* NÃO vão para o export. */
    function S(cls, names, multi) {
        const html = [].concat(names || []).map(icon).join('');
        return '<span class="' + cls + '" data-vb-icon-slot' + (multi ? ' data-vb-multi' : '') + '>' + html + '<\/span>';
    }

    /* =====================================================================
       3. BIBLIOTECA DE COMPONENTES (marcação Bootstrap pré-definida)
          {{uid}} é substituído por um id único ao inserir (evita ids duplicados).
       ===================================================================== */
    const CATEGORIES = [
        { id: 'navbars', name: 'Navbars' },
        { id: 'heroes', name: 'Heroes' },
        { id: 'features', name: 'Features' },
        { id: 'stats', name: 'Estatísticas' },
        { id: 'pricing', name: 'Pricing' },
        { id: 'testimonials', name: 'Testimonials' },
        { id: 'cta', name: 'Calls to Action' },
        { id: 'faq', name: 'FAQ' },
        { id: 'contact', name: 'Contato' },
        { id: 'footers', name: 'Footers' }
    ];

    // --- helpers de marcação (reduzem repetição) ---
    const U = '{{uid}}';
    const NAVLI = items => items.map((t, i) => '<li class="nav-item"><a class="nav-link' + (i === 0 ? ' active' : '') + '" href="#">' + t + '<\/a><\/li>').join('');
    const FLI = items => items.map(t => '<li class="mb-2"><a class="link-secondary text-decoration-none" href="#">' + t + '<\/a><\/li>').join('');
    const TOG = '<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav-' + U + '" aria-controls="nav-' + U + '" aria-expanded="false" aria-label="Alternar navegação"><span class="navbar-toggler-icon"><\/span><\/button>';
    const COPY = '© 2026 MinhaMarca, Inc. Todos os direitos reservados.';

    const plan = o => `<div class="col"><div class="card h-100 shadow-sm${o.hot ? ' border-primary border-2' : ''}">
    <div class="card-header py-3${o.hot ? ' text-bg-primary border-primary' : ''}"><h3 class="h5 my-0">${o.name}<\/h3><\/div>
    <div class="card-body d-flex flex-column">
      <p class="display-5 fw-bold mb-0">${o.price}<\/p>
      <p class="text-body-secondary">${o.per}<\/p>
      <ul class="list-unstyled mb-4">${o.feats.map(f => '<li class="mb-1">' + f + '<\/li>').join('')}<\/ul>
      <a class="btn ${o.hot ? 'btn-primary' : 'btn-outline-primary'} w-100 mt-auto" href="#" role="button">${o.cta}<\/a>
    <\/div><\/div><\/div>`;

    const testi = (q, n, r) => `<div class="col"><div class="card h-100 border-0 shadow-sm"><div class="card-body p-4">
    ${S('d-inline-flex gap-1 text-warning mb-3', ['star', 'star', 'star', 'star', 'star'], true)}
    <blockquote class="mb-4">“${q}”<\/blockquote>
    <div class="d-flex align-items-center gap-3">
      ${S('d-inline-flex rounded-circle bg-primary-subtle text-primary p-3 fs-4', 'user')}
      <div><p class="fw-semibold mb-0">${n}<\/p><small class="text-body-secondary">${r}<\/small><\/div>
    <\/div><\/div><\/div><\/div>`;

    const featCol = (ic, t, d) => `<div class="col-md-4">
    ${S('d-inline-flex align-items-center justify-content-center text-bg-primary rounded-3 mb-3 p-3 fs-2', ic)}
    <h3 class="h5">${t}<\/h3><p class="text-body-secondary mb-0">${d}<\/p><\/div>`;

    const featCard = (ic, t, d) => `<div class="col"><div class="card h-100 border-0 shadow-sm"><div class="card-body p-4">
    ${S('d-inline-block text-primary fs-1 mb-3', ic)}
    <h3 class="card-title h5">${t}<\/h3><p class="card-text text-body-secondary">${d}<\/p>
    <a class="link-primary text-decoration-none" href="#">Saiba mais →<\/a><\/div><\/div><\/div>`;

    const feat2x2 = (ic, t, d) => `<div class="col-md-6"><div class="d-flex gap-3">
    ${S('flex-shrink-0 d-inline-flex align-items-center justify-content-center text-bg-primary rounded-3 p-3 fs-4', ic)}
    <div><h3 class="h5">${t}<\/h3><p class="text-body-secondary mb-0">${d}<\/p><\/div><\/div><\/div>`;

    const check = (t, d) => `<li class="d-flex gap-3">${S('flex-shrink-0 text-success fs-4', 'check-circle')}<div><h3 class="h6 mb-1">${t}<\/h3><p class="mb-0 text-body-secondary">${d}<\/p><\/div><\/li>`;

    const stat = (n, l, ncls, lcls) => `<div class="col-6 col-md-3"><p class="${ncls} mb-0">${n}<\/p><p class="${lcls} mb-0">${l}<\/p><\/div>`;

    const faq = (q, a) => `<div class="col-md-6"><h3 class="h5">${q}<\/h3><p class="text-body-secondary mb-0">${a}<\/p><\/div>`;

    const COMPONENTS = [];
    const def = (id, cat, name, html) => COMPONENTS.push({ id, cat, name, html: html.trim() });

    /* ---------- NAVBARS ---------- */
    def('nav-light', 'navbars', 'Navbar clara', `
<nav class="navbar navbar-expand-lg bg-body-tertiary border-bottom">
  <div class="container">
    <a class="navbar-brand fw-bold text-primary" href="#">MinhaMarca<\/a>
    ${TOG}
    <div class="collapse navbar-collapse" id="nav-${U}">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">${NAVLI(['Início', 'Recursos', 'Preços', 'Contato'])}<\/ul>
      ${S('d-inline-flex gap-3 fs-5 me-lg-3 my-2 my-lg-0 text-body-secondary', [], true)}
      <a class="btn btn-primary" href="#" role="button">Começar<\/a>
    <\/div>
  <\/div>
<\/nav>`);

    def('nav-dark', 'navbars', 'Navbar escura', `
<nav class="navbar navbar-expand-lg bg-dark" data-bs-theme="dark">
  <div class="container">
    <a class="navbar-brand fw-bold" href="#">MinhaMarca<\/a>
    ${TOG}
    <div class="collapse navbar-collapse" id="nav-${U}">
      <ul class="navbar-nav ms-auto mb-2 mb-lg-0">${NAVLI(['Início', 'Sobre', 'Serviços', 'Blog'])}<\/ul>
      ${S('d-inline-flex gap-3 fs-5 mx-lg-3 my-2 my-lg-0 text-body-secondary', [], true)}
      <a class="btn btn-primary" href="#" role="button">Fale conosco<\/a>
    <\/div>
  <\/div>
<\/nav>`);

    def('nav-primary', 'navbars', 'Navbar colorida', `
<nav class="navbar navbar-expand-lg bg-primary" data-bs-theme="dark">
  <div class="container">
    <a class="navbar-brand fw-bold" href="#">MinhaMarca<\/a>
    ${TOG}
    <div class="collapse navbar-collapse" id="nav-${U}">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">${NAVLI(['Início', 'Produtos', 'Planos', 'Ajuda'])}<\/ul>
      ${S('d-inline-flex gap-3 fs-5 me-lg-3 my-2 my-lg-0', [], true)}
      <a class="btn btn-light" href="#" role="button">Entrar<\/a>
    <\/div>
  <\/div>
<\/nav>`);

    def('nav-centered', 'navbars', 'Header com pills', `
<header class="py-3 border-bottom bg-body">
  <div class="container d-flex flex-wrap justify-content-center justify-content-md-between align-items-center gap-3">
    <a class="fs-4 fw-bold text-decoration-none text-primary" href="#">MinhaMarca<\/a>
    <ul class="nav nav-pills">${NAVLI(['Início', 'Recursos', 'Preços', 'FAQ'])}<\/ul>
    <div class="d-flex align-items-center gap-3">
      ${S('d-inline-flex gap-3 fs-5 text-body-secondary', [], true)}
      <a class="btn btn-outline-primary" href="#" role="button">Entrar<\/a>
      <a class="btn btn-primary" href="#" role="button">Cadastrar<\/a>
    <\/div>
  <\/div>
<\/header>`);

    def('nav-shop', 'navbars', 'Navbar e-commerce (carrinho)', `
<nav class="navbar navbar-expand-lg bg-body border-bottom">
  <div class="container">
    <a class="navbar-brand fw-bold" href="#">MinhaLoja<\/a>
    ${TOG}
    <div class="collapse navbar-collapse" id="nav-${U}">
      <ul class="navbar-nav me-lg-3 mb-2 mb-lg-0">${NAVLI(['Novidades', 'Ofertas', 'Categorias'])}<\/ul>
      <div class="input-group w-auto flex-grow-1 me-lg-3 my-2 my-lg-0">
        <input class="form-control" type="search" placeholder="Buscar produtos" aria-label="Buscar produtos">
        <span class="input-group-text">${icon('search')}<\/span>
      <\/div>
      <div class="d-flex align-items-center gap-3 fs-5">
        ${S('d-inline-flex gap-3', 'user', true)}
        <span class="position-relative d-inline-flex">
          ${S('d-inline-flex gap-2 fs-4', 'cart', true)}
          <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-danger">3<\/span>
        <\/span>
      <\/div>
    <\/div>
  <\/div>
<\/nav>`);

    /* ---------- HEROES ---------- */
    def('hero-centered', 'heroes', 'Hero centralizado', `
<section class="py-5 bg-body text-center">
  <div class="container py-5">
    <h1 class="display-4 fw-bold">Construa algo incrível hoje<\/h1>
    <div class="col-lg-7 mx-auto">
      <p class="lead mb-4 text-body-secondary">Uma frase curta e poderosa que explica o valor do seu produto e convence o visitante a dar o próximo passo.<\/p>
      <div class="d-grid gap-2 d-sm-flex justify-content-sm-center">
        <a class="btn btn-primary btn-lg px-4" href="#" role="button">Comece agora<\/a>
        <a class="btn btn-outline-secondary btn-lg px-4" href="#" role="button">Saiba mais<\/a>
      <\/div>
    <\/div>
  <\/div>
<\/section>`);

    def('hero-split', 'heroes', 'Hero dividido (texto + visual)', `
<section class="py-5 bg-body">
  <div class="container">
    <div class="row align-items-center g-5 py-4">
      <div class="col-lg-6">
        <h1 class="display-5 fw-bold lh-1 mb-3">Transforme ideias em resultados<\/h1>
        <p class="lead text-body-secondary">Descreva em duas linhas o principal benefício do seu produto e para quem ele foi criado.<\/p>
        <div class="d-grid gap-2 d-md-flex justify-content-md-start">
          <a class="btn btn-primary btn-lg px-4 me-md-2" href="#" role="button">Começar grátis<\/a>
          <a class="btn btn-outline-secondary btn-lg px-4" href="#" role="button">Ver demonstração<\/a>
        <\/div>
      <\/div>
      <div class="col-lg-6">
        <div class="ratio ratio-4x3 rounded-4 bg-primary-subtle">
          <div class="d-flex align-items-center justify-content-center">${S('display-1 text-primary', 'trending')}<\/div>
        <\/div>
      <\/div>
    <\/div>
  <\/div>
<\/section>`);

    def('hero-dark', 'heroes', 'Hero escuro', `
<section class="bg-dark py-5" data-bs-theme="dark">
  <div class="container py-5 text-center">
    <h1 class="display-3 fw-bold text-body-emphasis">O futuro começa aqui<\/h1>
    <div class="col-lg-6 mx-auto">
      <p class="fs-5 mb-4 text-body-secondary">Texto de apoio que reforça a proposta de valor com clareza e objetividade.<\/p>
      <div class="d-grid gap-2 d-sm-flex justify-content-sm-center">
        <a class="btn btn-primary btn-lg px-4 gap-3" href="#" role="button">Quero começar<\/a>
        <a class="btn btn-outline-light btn-lg px-4" href="#" role="button">Documentação<\/a>
      <\/div>
    <\/div>
  <\/div>
<\/section>`);

    def('hero-signup', 'heroes', 'Hero com cadastro de e-mail', `
<section class="py-5 bg-body-tertiary">
  <div class="container py-4 text-center">
    <p class="mb-3"><span class="badge rounded-pill text-bg-primary px-3 py-2">Lançamento 2026<\/span><\/p>
    <h1 class="display-5 fw-bold">Entre na lista de espera<\/h1>
    <div class="col-md-8 col-lg-6 mx-auto">
      <p class="lead text-body-secondary mb-4">Seja um dos primeiros a experimentar. Cadastre seu e-mail e avisaremos no lançamento.<\/p>
      <div class="input-group input-group-lg">
        <input type="email" class="form-control" placeholder="seu@email.com" aria-label="E-mail">
        <a class="btn btn-primary" href="#" role="button">Quero participar<\/a>
      <\/div>
    <\/div>
  <\/div>
<\/section>`);

    def('hero-jumbotron', 'heroes', 'Hero estilo jumbotron', `
<section class="py-5">
  <div class="container">
    <div class="p-5 bg-primary-subtle border border-primary-subtle rounded-4">
      <div class="container-fluid py-3">
        <h1 class="display-5 fw-bold text-primary-emphasis">Tudo o que sua equipe precisa<\/h1>
        <p class="col-md-8 fs-5">Centralize processos, reduza retrabalho e ganhe tempo para o que realmente importa.<\/p>
        <a class="btn btn-primary btn-lg" href="#" role="button">Conhecer a plataforma<\/a>
      <\/div>
    <\/div>
  <\/div>
<\/section>`);

    /* ---------- FEATURES ---------- */
    def('feat-icons', 'features', 'Features com ícones (3 colunas)', `
<section class="py-5">
  <div class="container">
    <div class="text-center mb-5">
      <h2 class="fw-bold">Tudo o que você precisa<\/h2>
      <p class="text-body-secondary mb-0">Recursos pensados para simplificar o seu dia a dia.<\/p>
    <\/div>
    <div class="row g-4 text-center">
      ${featCol('zap', 'Rápido', 'Desempenho de ponta para você não perder tempo com espera.')}
      ${featCol('shield', 'Seguro', 'Seus dados protegidos com as melhores práticas do mercado.')}
      ${featCol('sliders', 'Flexível', 'Ajuste cada detalhe para que tudo funcione do seu jeito.')}
    <\/div>
  <\/div>
<\/section>`);

    def('feat-cards', 'features', 'Features em cards', `
<section class="py-5 bg-body-tertiary">
  <div class="container">
    <div class="text-center mb-5">
      <h2 class="fw-bold">Por que nos escolher<\/h2>
      <p class="text-body-secondary mb-0">Três motivos para começar agora mesmo.<\/p>
    <\/div>
    <div class="row row-cols-1 row-cols-md-3 g-4">
      ${featCard('globe', 'Alcance global', 'Chegue a clientes em qualquer lugar com uma presença online sólida.')}
      ${featCard('users', 'Feito para equipes', 'Colabore em tempo real e mantenha todos alinhados.')}
      ${featCard('trending', 'Crescimento contínuo', 'Acompanhe métricas e evolua com base em dados reais.')}
    <\/div>
  <\/div>
<\/section>`);

    def('feat-alt', 'features', 'Features alternadas (texto + visual)', `
<section class="py-5">
  <div class="container">
    <div class="row align-items-center g-5 mb-5">
      <div class="col-md-6">
        <h2 class="fw-bold">Organização sem esforço<\/h2>
        <p class="text-body-secondary">Explique aqui o primeiro grande benefício, com uma ou duas frases diretas.<\/p>
        <a class="link-primary text-decoration-none" href="#">Saiba mais →<\/a>
      <\/div>
      <div class="col-md-6"><div class="ratio ratio-16x9 rounded-4 bg-primary-subtle"><div class="d-flex align-items-center justify-content-center">${S('display-2 text-primary', 'box')}<\/div><\/div><\/div>
    <\/div>
    <div class="row align-items-center g-5">
      <div class="col-md-6 order-md-2">
        <h2 class="fw-bold">Resultados que você enxerga<\/h2>
        <p class="text-body-secondary">Explique aqui o segundo benefício, reforçando o diferencial do seu produto.<\/p>
        <a class="link-primary text-decoration-none" href="#">Saiba mais →<\/a>
      <\/div>
      <div class="col-md-6 order-md-1"><div class="ratio ratio-16x9 rounded-4 bg-success-subtle"><div class="d-flex align-items-center justify-content-center">${S('display-2 text-success', 'trending')}<\/div><\/div><\/div>
    <\/div>
  <\/div>
<\/section>`);

    def('feat-checklist', 'features', 'Features em lista de verificação', `
<section class="py-5">
  <div class="container">
    <div class="row g-5 align-items-center">
      <div class="col-lg-5">
        <h2 class="fw-bold">Por que escolher a gente?<\/h2>
        <p class="text-body-secondary mb-4">Um resumo do que torna a sua solução a melhor escolha para o cliente.<\/p>
        <a class="btn btn-primary" href="#" role="button">Ver planos<\/a>
      <\/div>
      <div class="col-lg-7">
        <ul class="list-unstyled mb-0 vstack gap-3">
          ${check('Configuração em minutos', 'Comece a usar sem instalações complicadas.')}
          ${check('Suporte humano', 'Nossa equipe responde rápido quando você precisa.')}
          ${check('Sem fidelidade', 'Cancele quando quiser, sem multas ou burocracia.')}
          ${check('Atualizações constantes', 'Novos recursos toda semana, sem custo extra.')}
        <\/ul>
      <\/div>
    <\/div>
  <\/div>
<\/section>`);

    def('feat-grid', 'features', 'Features em grade 2×2', `
<section class="py-5 bg-body-tertiary">
  <div class="container">
    <div class="text-center mb-5"><h2 class="fw-bold">Recursos principais<\/h2><\/div>
    <div class="row g-4">
      ${feat2x2('lock', 'Privacidade', 'Controle total sobre quem vê o quê.')}
      ${feat2x2('clock', 'Economia de tempo', 'Automatize tarefas repetitivas em poucos cliques.')}
      ${feat2x2('message', 'Comunicação', 'Converse com clientes e equipe em um só lugar.')}
      ${feat2x2('heart', 'Experiência', 'Interface simples que as pessoas realmente gostam de usar.')}
    <\/div>
  <\/div>
<\/section>`);

    /* ---------- ESTATÍSTICAS ---------- */
    def('stats-light', 'stats', 'Números em destaque', `
<section class="py-5 bg-body-tertiary">
  <div class="container">
    <div class="row g-4 text-center">
      ${stat('10 mil+', 'Clientes ativos', 'display-5 fw-bold text-primary', 'text-body-secondary')}
      ${stat('99,9%', 'Disponibilidade', 'display-5 fw-bold text-primary', 'text-body-secondary')}
      ${stat('45', 'Países atendidos', 'display-5 fw-bold text-primary', 'text-body-secondary')}
      ${stat('4,9/5', 'Avaliação média', 'display-5 fw-bold text-primary', 'text-body-secondary')}
    <\/div>
  <\/div>
<\/section>`);

    def('stats-color', 'stats', 'Números sobre fundo colorido', `
<section class="text-bg-primary py-5">
  <div class="container">
    <div class="row g-4 text-center">
      ${stat('+250', 'Projetos entregues', 'display-4 fw-bold', 'opacity-75')}
      ${stat('12', 'Anos de experiência', 'display-4 fw-bold', 'opacity-75')}
      ${stat('98%', 'Clientes satisfeitos', 'display-4 fw-bold', 'opacity-75')}
      ${stat('24/7', 'Suporte dedicado', 'display-4 fw-bold', 'opacity-75')}
    <\/div>
  <\/div>
<\/section>`);

    /* ---------- PRICING ---------- */
    def('price-3', 'pricing', 'Planos (3 cards)', `
<section class="py-5">
  <div class="container">
    <div class="text-center mb-5">
      <h2 class="fw-bold">Planos simples e transparentes<\/h2>
      <p class="text-body-secondary mb-0">Escolha o plano ideal para o seu momento.<\/p>
    <\/div>
    <div class="row row-cols-1 row-cols-md-3 g-4 text-center">
      ${plan({ name: 'Básico', price: 'R$ 29', per: 'por mês', feats: ['1 projeto', '5 GB de espaço', 'Suporte por e-mail'], cta: 'Escolher Básico' })}
      ${plan({ name: 'Pro', price: 'R$ 79', per: 'por mês', feats: ['10 projetos', '50 GB de espaço', 'Suporte prioritário'], cta: 'Escolher Pro', hot: true })}
      ${plan({ name: 'Empresarial', price: 'R$ 199', per: 'por mês', feats: ['Projetos ilimitados', '500 GB de espaço', 'Gerente de conta'], cta: 'Falar com vendas' })}
    <\/div>
  <\/div>
<\/section>`);

    def('price-2', 'pricing', 'Planos (2 cards)', `
<section class="py-5 bg-body-tertiary">
  <div class="container">
    <div class="text-center mb-5"><h2 class="fw-bold">Escolha seu plano<\/h2><\/div>
    <div class="row justify-content-center">
      <div class="col-lg-9">
        <div class="row row-cols-1 row-cols-md-2 g-4 text-center">
          ${plan({ name: 'Gratuito', price: 'R$ 0', per: 'para sempre', feats: ['1 usuário', 'Recursos essenciais', 'Comunidade'], cta: 'Começar grátis' })}
          ${plan({ name: 'Premium', price: 'R$ 59', per: 'por mês', feats: ['Usuários ilimitados', 'Todos os recursos', 'Suporte 24/7'], cta: 'Assinar Premium', hot: true })}
        <\/div>
      <\/div>
    <\/div>
  <\/div>
<\/section>`);

    def('price-table', 'pricing', 'Tabela comparativa', `
<section class="py-5">
  <div class="container">
    <div class="text-center mb-5"><h2 class="fw-bold">Compare os planos<\/h2><\/div>
    <div class="table-responsive">
      <table class="table table-bordered text-center align-middle mb-0">
        <thead class="table-light">
          <tr><th scope="col" class="text-start">Recurso<\/th><th scope="col">Básico<\/th><th scope="col">Pro<\/th><th scope="col">Empresarial<\/th><\/tr>
        <\/thead>
        <tbody>
          <tr><th scope="row" class="text-start">Projetos<\/th><td>1<\/td><td>10<\/td><td>Ilimitados<\/td><\/tr>
          <tr><th scope="row" class="text-start">Armazenamento<\/th><td>5 GB<\/td><td>50 GB<\/td><td>500 GB<\/td><\/tr>
          <tr><th scope="row" class="text-start">Suporte<\/th><td>E-mail<\/td><td>Prioritário<\/td><td>Dedicado<\/td><\/tr>
          <tr><th scope="row" class="text-start">Preço mensal<\/th><td>R$ 29<\/td><td>R$ 79<\/td><td>R$ 199<\/td><\/tr>
          <tr><td><\/td><td><a class="btn btn-outline-primary" href="#" role="button">Escolher<\/a><\/td><td><a class="btn btn-primary" href="#" role="button">Escolher<\/a><\/td><td><a class="btn btn-outline-primary" href="#" role="button">Contato<\/a><\/td><\/tr>
        <\/tbody>
      <\/table>
    <\/div>
  <\/div>
<\/section>`);

    /* ---------- TESTIMONIALS ---------- */
    def('testi-3', 'testimonials', 'Depoimentos (3 cards)', `
<section class="py-5 bg-body-tertiary">
  <div class="container">
    <div class="text-center mb-5">
      <h2 class="fw-bold">O que nossos clientes dizem<\/h2>
      <p class="text-body-secondary mb-0">Histórias reais de quem já usa.<\/p>
    <\/div>
    <div class="row row-cols-1 row-cols-md-3 g-4">
      ${testi('Mudou completamente a forma como a nossa equipe trabalha. Recomendo sem hesitar.', 'Ana Martins', 'Diretora de Operações')}
      ${testi('Implantação rápida e suporte excelente. O retorno veio já no primeiro mês.', 'Carlos Lima', 'Fundador da Lima & Co.')}
      ${testi('Simples, bonito e eficiente. Exatamente o que procurávamos há anos.', 'Juliana Rocha', 'Gerente de Produto')}
    <\/div>
  <\/div>
<\/section>`);

    def('testi-single', 'testimonials', 'Depoimento em destaque', `
<section class="py-5">
  <div class="container">
    <div class="col-lg-8 mx-auto text-center">
      ${S('d-inline-block fs-1 text-primary mb-3', 'message')}
      <figure class="mb-0">
        <blockquote class="blockquote fs-3 mb-4">“Foi a melhor decisão que tomamos este ano. Em poucas semanas já víamos o impacto nos resultados.”<\/blockquote>
        <figcaption class="blockquote-footer mb-0">Maria Souza, Diretora na Empresa X<\/figcaption>
      <\/figure>
    <\/div>
  <\/div>
<\/section>`);

    def('testi-split', 'testimonials', 'Depoimentos divididos', `
<section class="py-5 bg-body-tertiary">
  <div class="container">
    <div class="row g-5 align-items-center">
      <div class="col-lg-4">
        <h2 class="fw-bold">Amado por quem usa<\/h2>
        <p class="text-body-secondary mb-0">Milhares de pessoas e empresas confiam em nós todos os dias.<\/p>
      <\/div>
      <div class="col-lg-8">
        <div class="row row-cols-1 row-cols-md-2 g-4">
          ${testi('Interface limpa e muito intuitiva. Toda a equipe aprendeu em um dia.', 'Pedro Alves', 'Designer')}
          ${testi('O suporte é o diferencial. Sempre rápidos e atenciosos.', 'Fernanda Dias', 'Gerente de Projetos')}
        <\/div>
      <\/div>
    <\/div>
  <\/div>
<\/section>`);

    /* ---------- CALLS TO ACTION ---------- */
    def('cta-banner', 'cta', 'CTA faixa colorida', `
<section class="text-bg-primary py-5">
  <div class="container text-center py-4">
    <h2 class="display-6 fw-bold">Pronto para começar?<\/h2>
    <p class="lead mb-4">Crie sua conta gratuita em menos de um minuto.<\/p>
    <a class="btn btn-light btn-lg px-4" href="#" role="button">Criar conta grátis<\/a>
  <\/div>
<\/section>`);

    def('cta-card', 'cta', 'CTA em card', `
<section class="py-5">
  <div class="container">
    <div class="card text-center border-0 bg-body-tertiary py-5">
      <div class="card-body">
        <h2 class="fw-bold">Vamos conversar sobre o seu projeto?<\/h2>
        <p class="text-body-secondary mb-4">Agende uma conversa sem compromisso com nossa equipe.<\/p>
        <div class="d-flex flex-wrap justify-content-center gap-2">
          <a class="btn btn-primary btn-lg" href="#" role="button">Agendar conversa<\/a>
          <a class="btn btn-outline-secondary btn-lg" href="#" role="button">Ver portfólio<\/a>
        <\/div>
      <\/div>
    <\/div>
  <\/div>
<\/section>`);

    def('cta-split', 'cta', 'CTA texto + botão', `
<section class="py-5 bg-body border-top border-bottom">
  <div class="container">
    <div class="row align-items-center g-4">
      <div class="col-lg-8">
        <h2 class="fw-bold mb-1">Comece hoje mesmo<\/h2>
        <p class="mb-0 text-body-secondary">Sem cartão de crédito. Cancele quando quiser.<\/p>
      <\/div>
      <div class="col-lg-4 text-lg-end"><a class="btn btn-primary btn-lg" href="#" role="button">Experimentar grátis<\/a><\/div>
    <\/div>
  <\/div>
<\/section>`);

    def('cta-newsletter', 'cta', 'CTA newsletter', `
<section class="py-5 bg-primary-subtle">
  <div class="container">
    <div class="row justify-content-center text-center">
      <div class="col-lg-6">
        <h2 class="fw-bold">Assine nossa newsletter<\/h2>
        <p class="text-body-secondary mb-4">Receba novidades e conteúdos exclusivos direto no seu e-mail.<\/p>
        <div class="input-group input-group-lg">
          <input type="email" class="form-control" placeholder="Seu melhor e-mail" aria-label="E-mail">
          <a class="btn btn-primary" href="#" role="button">Assinar<\/a>
        <\/div>
        <p class="mt-2 mb-0"><small class="text-body-secondary">Sem spam. Cancele quando quiser.<\/small><\/p>
      <\/div>
    <\/div>
  <\/div>
<\/section>`);

    def('cta-dark', 'cta', 'CTA escuro arredondado', `
<section class="py-5">
  <div class="container">
    <div class="bg-dark rounded-4 p-5 text-center" data-bs-theme="dark">
      <h2 class="display-6 fw-bold">Leve seu negócio ao próximo nível<\/h2>
      <p class="text-body-secondary mb-4">Junte-se a milhares de empresas que já estão crescendo com a gente.<\/p>
      <a class="btn btn-primary btn-lg px-4" href="#" role="button">Começar agora<\/a>
    <\/div>
  <\/div>
<\/section>`);

    /* ---------- FAQ ---------- */
    def('faq-grid', 'faq', 'Perguntas frequentes', `
<section class="py-5">
  <div class="container">
    <div class="text-center mb-5">
      <h2 class="fw-bold">Perguntas frequentes<\/h2>
      <p class="text-body-secondary mb-0">Não encontrou o que procura? Fale com a gente.<\/p>
    <\/div>
    <div class="row g-4">
      ${faq('Como funciona o período de teste?', 'Você pode testar todos os recursos gratuitamente por 14 dias, sem cartão.')}
      ${faq('Posso cancelar a qualquer momento?', 'Sim. Não há fidelidade nem multa de cancelamento.')}
      ${faq('Vocês oferecem suporte?', 'Claro! Atendimento por e-mail e chat em horário comercial.')}
      ${faq('Meus dados estão seguros?', 'Utilizamos criptografia e backups diários para proteger suas informações.')}
    <\/div>
  <\/div>
<\/section>`);

    /* ---------- CONTATO ---------- */
    def('contact-form', 'contact', 'Formulário de contato', `
<section class="py-5 bg-body-tertiary">
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-lg-6">
        <h2 class="fw-bold text-center mb-4">Fale com a gente<\/h2>
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4">
            <div class="row g-3">
              <div class="col-md-6"><label class="form-label" for="name-${U}">Nome<\/label><input type="text" class="form-control" id="name-${U}" placeholder="Seu nome"><\/div>
              <div class="col-md-6"><label class="form-label" for="email-${U}">E-mail<\/label><input type="email" class="form-control" id="email-${U}" placeholder="voce@email.com"><\/div>
              <div class="col-12"><label class="form-label" for="msg-${U}">Mensagem<\/label><textarea class="form-control" id="msg-${U}" rows="4" placeholder="Como podemos ajudar?"><\/textarea><\/div>
              <div class="col-12 d-grid"><a class="btn btn-primary btn-lg" href="#" role="button">Enviar mensagem<\/a><\/div>
            <\/div>
          <\/div>
        <\/div>
      <\/div>
    <\/div>
  <\/div>
<\/section>`);

    /* ---------- FOOTERS ---------- */
    def('foot-simple', 'footers', 'Footer simples', `
<footer class="py-4 bg-body border-top">
  <div class="container">
    <ul class="nav justify-content-center border-bottom pb-3 mb-3">
      ${['Início', 'Recursos', 'Preços', 'FAQ', 'Sobre'].map(t => '<li class="nav-item"><a class="nav-link px-2 text-body-secondary" href="#">' + t + '<\/a><\/li>').join('')}
    <\/ul>
    <p class="text-center text-body-secondary mb-0">${COPY}<\/p>
  <\/div>
<\/footer>`);

    def('foot-dark', 'footers', 'Footer escuro em colunas', `
<footer class="bg-dark py-5" data-bs-theme="dark">
  <div class="container">
    <div class="row g-4">
      <div class="col-lg-4">
        <a class="d-inline-block fs-4 fw-bold text-decoration-none text-body-emphasis mb-2" href="#">MinhaMarca<\/a>
        <p class="text-body-secondary">Construindo experiências digitais que fazem a diferença.<\/p>
        ${S('d-inline-flex gap-3 fs-4 text-body-secondary', ['instagram', 'twitter', 'linkedin'], true)}
      <\/div>
      <div class="col-6 col-lg-2 offset-lg-2"><h3 class="h6 text-uppercase text-body-emphasis">Produto<\/h3><ul class="list-unstyled">${FLI(['Recursos', 'Preços', 'Novidades'])}<\/ul><\/div>
      <div class="col-6 col-lg-2"><h3 class="h6 text-uppercase text-body-emphasis">Empresa<\/h3><ul class="list-unstyled">${FLI(['Sobre', 'Carreiras', 'Blog'])}<\/ul><\/div>
      <div class="col-6 col-lg-2"><h3 class="h6 text-uppercase text-body-emphasis">Suporte<\/h3><ul class="list-unstyled">${FLI(['Ajuda', 'Contato', 'Status'])}<\/ul><\/div>
    <\/div>
    <hr class="my-4">
    <p class="text-body-secondary mb-0">${COPY}<\/p>
  <\/div>
<\/footer>`);

    def('foot-light', 'footers', 'Footer claro com newsletter', `
<footer class="bg-body-tertiary border-top py-5">
  <div class="container">
    <div class="row g-4">
      <div class="col-lg-4"><h3 class="h5 fw-bold text-primary">MinhaMarca<\/h3><p class="text-body-secondary mb-0">Soluções simples para problemas complexos.<\/p><\/div>
      <div class="col-6 col-lg-2"><h3 class="h6 text-uppercase">Links<\/h3><ul class="list-unstyled mb-0">${FLI(['Início', 'Recursos', 'Preços'])}<\/ul><\/div>
      <div class="col-6 col-lg-2"><h3 class="h6 text-uppercase">Legal<\/h3><ul class="list-unstyled mb-0">${FLI(['Termos', 'Privacidade', 'Cookies'])}<\/ul><\/div>
      <div class="col-lg-4">
        <h3 class="h6 text-uppercase">Newsletter<\/h3>
        <div class="input-group">
          <input type="email" class="form-control" placeholder="Seu e-mail" aria-label="E-mail">
          <a class="btn btn-primary" href="#" role="button">Assinar<\/a>
        <\/div>
      <\/div>
    <\/div>
    <hr class="my-4">
    <p class="text-body-secondary small mb-0">${COPY}<\/p>
  <\/div>
<\/footer>`);

    def('foot-minimal', 'footers', 'Footer minimalista', `
<footer class="py-3 border-top bg-body">
  <div class="container d-flex flex-wrap justify-content-between align-items-center gap-2">
    <p class="mb-0 text-body-secondary">© 2026 MinhaMarca<\/p>
    ${S('d-inline-flex gap-3 fs-5 text-body-secondary', ['facebook', 'instagram', 'linkedin'], true)}
  <\/div>
<\/footer>`);

    const COMP_MAP = new Map(COMPONENTS.map(c => [c.id, c]));

    /* =====================================================================
       4. ESTADO, REFERÊNCIAS DE DOM E UTILITÁRIOS
       ===================================================================== */
    const $ = id => document.getElementById(id);
    const canvas = $('canvas');
    const wrap = $('canvasWrap');
    const stage = $('stage');
    const indicator = $('dropIndicator');
    const picker = $('iconPicker');

    const state = {
        selected: null,   // bloco selecionado
        drag: null,       // {type:'new', id} | {type:'move', el}
        slot: null,       // slot de ícone com o seletor aberto
        preview: false    // modo pré-visualização
    };
    let seq = 0;
    const newUid = () => 'b' + (++seq);
    const elOf = t => (t instanceof Element ? t : (t && t.parentElement) || null);
    const getBlocks = () => Array.from(canvas.children).filter(n => n.classList.contains('vb-block'));
    const rootOf = w => w.lastElementChild; // a marcação Bootstrap da seção (a toolbar é sempre o 1º filho)

    /** Mensagens rápidas (Bootstrap Toast), com ação opcional (ex.: Desfazer). */
    function toast(message, type, action) {
        const host = $('toastHost');
        const el = document.createElement('div');
        el.className = 'toast align-items-center text-bg-' + (type || 'dark') + ' border-0';
        el.setAttribute('role', 'status');
        el.setAttribute('aria-live', 'polite');
        el.setAttribute('aria-atomic', 'true');
        const flex = document.createElement('div');
        flex.className = 'd-flex';
        const body = document.createElement('div');
        body.className = 'toast-body';
        body.textContent = message;
        flex.appendChild(body);
        let t = null;
        const hide = () => { if (t) t.hide(); else el.remove(); };
        if (action) {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'btn btn-sm btn-light align-self-center me-2';
            b.textContent = action.label;
            b.addEventListener('click', () => { try { action.run(); } finally { hide(); } });
            flex.appendChild(b);
        }
        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'btn-close btn-close-white m-auto me-2';
        close.setAttribute('aria-label', 'Fechar');
        close.addEventListener('click', hide);
        flex.appendChild(close);
        el.appendChild(flex);
        host.appendChild(el);
        if (!window.bootstrap) { el.classList.add('show'); setTimeout(() => el.remove(), 4000); return; }
        t = new bootstrap.Toast(el, { delay: action ? 6000 : 2800 });
        el.addEventListener('hidden.bs.toast', () => el.remove());
        t.show();
    }

    /** Diálogo de confirmação baseado em modal Bootstrap (retorna Promise<boolean>). */
    function confirmDialog(message) {
        return new Promise(resolve => {
            if (!window.bootstrap) { resolve(window.confirm(message)); return; }
            const el = $('confirmModal');
            $('confirmMsg').textContent = message;
            const modal = bootstrap.Modal.getOrCreateInstance(el);
            const okBtn = $('confirmOk');
            let ok = false;
            const onOk = () => { ok = true; modal.hide(); };
            okBtn.addEventListener('click', onOk, { once: true });
            el.addEventListener('hidden.bs.modal', () => { okBtn.removeEventListener('click', onOk); resolve(ok); }, { once: true });
            modal.show();
        });
    }

    /* =====================================================================
       5. SANITIZAÇÃO, PREPARO E LIMPEZA DE MARCAÇÃO
       ===================================================================== */

    /** Converte uma string HTML em elemento raiz. Lança erro se for inválida. */
    function parseRoot(html) {
        const t = document.createElement('template');
        t.innerHTML = String(html).trim();
        const root = t.content.firstElementChild;
        if (!root) throw new Error('Marcação inválida');
        return root;
    }

    /** Remove tags e atributos perigosos (rascunho do localStorage pode ter sido adulterado). */
    function sanitize(root) {
        if (/^(script|iframe|object|embed|link|meta|style|base|form)$/i.test(root.tagName)) throw new Error('Elemento não permitido');
        root.querySelectorAll('script,iframe,object,embed,link,meta,style,base,form').forEach(n => n.remove());
        [root, ...root.querySelectorAll('*')].forEach(el => {
            Array.from(el.attributes).forEach(a => {
                const n = a.name.toLowerCase();
                const urlAttr = ['href', 'src', 'action', 'formaction', 'xlink:href'].includes(n);
                if (n.startsWith('on') || (urlAttr && /^\s*(javascript|data):/i.test(a.value))) el.removeAttribute(a.name);
            });
        });
    }

    /** Um elemento é editável se casar com EDIT_SEL e contiver apenas texto (e <br>). */
    function isEditable(el) {
        if (el instanceof SVGElement) return false;
        if (el.closest('svg') || el.closest('[data-vb-icon-slot]')) return false;
        if (!el.matches(EDIT_SEL)) return false;
        if (el.querySelector(':scope > :not(br)')) return false;
        return true;
    }

    /** Marca elementos editáveis e slots de ícone (somente atributos/classes do construtor). */
    function prepareRoot(root) {
        [root, ...root.querySelectorAll('*')].forEach(el => {
            if (el instanceof SVGElement) return;
            if (isEditable(el)) {
                el.setAttribute('contenteditable', state.preview ? 'false' : 'true');
                el.setAttribute('spellcheck', 'false');
                el.classList.add('vb-editable');
                if (el.tagName === 'A') el.setAttribute('draggable', 'false'); // evita arrastar o link em vez de selecionar texto
            }
            if (el.hasAttribute('data-vb-icon-slot')) el.classList.add('vb-slot');
        });
    }

    /**
     * Clona uma seção removendo TODO rastro do construtor (contenteditable, data-vb-*, classes vb-*).
     * `keepSlots` mantém os slots (usado no rascunho/duplicação); no export slots vazios são removidos.
     */
    function cleanClone(root, opts) {
        const keepSlots = !!(opts && opts.keepSlots);
        const clone = root.cloneNode(true);
        if (!keepSlots) {
            clone.querySelectorAll('[data-vb-icon-slot]').forEach(s => {
                if (!s.children.length && !s.textContent.trim()) s.remove();
            });
        }
        [clone, ...clone.querySelectorAll('*')].forEach(el => {
            Array.from(el.attributes).forEach(a => {
                const n = a.name;
                if (n === 'contenteditable' || n === 'spellcheck' || n === 'draggable') el.removeAttribute(n);
                else if (n.startsWith('data-vb-')) {
                    if (keepSlots && (n === 'data-vb-icon-slot' || n === 'data-vb-multi')) return;
                    el.removeAttribute(n);
                }
            });
            Array.from(el.classList).filter(c => c.startsWith('vb-')).forEach(c => el.classList.remove(c));
            if (el.hasAttribute('class') && el.classList.length === 0) el.removeAttribute('class');
        });
        return clone;
    }

    /** Reatribui ids/alvos de uma seção clonada (collapse, labels) para não colidirem com a original. */
    function retargetIds(root, oldUid, nextUid) {
        if (!/^b\d+$/.test(String(oldUid))) return;
        const re = new RegExp('-' + oldUid + '(?![0-9a-z])', 'g');
        const attrs = ['id', 'data-bs-target', 'aria-controls', 'aria-labelledby', 'aria-describedby', 'for', 'href'];
        [root, ...root.querySelectorAll('*')].forEach(el => {
            attrs.forEach(a => {
                const v = el.getAttribute(a);
                if (!v || (a === 'href' && !v.startsWith('#'))) return;
                const nv = v.replace(re, '-' + nextUid);
                if (nv !== v) el.setAttribute(a, nv);
            });
        });
    }

    /* =====================================================================
       6. BLOCOS NO CANVAS (criar, inserir, mover, duplicar, remover)
       ===================================================================== */

    function buildToolbar(d, hasSlots, accent) {
        const t = document.createElement('div');
        t.className = 'vb-toolbar';
        t.contentEditable = 'false';
        t.setAttribute('role', 'toolbar');
        t.setAttribute('aria-label', 'Ações da seção ' + d.name);
        t.innerHTML =
            '<span class="vb-handle" draggable="true" title="Arraste para reordenar" aria-label="Arrastar seção">' + icon('grip') + '<\/span>' +
            '<span class="vb-label">' + d.name + '<\/span>' +
            '<select class="form-select form-select-sm vb-accent" data-act="accent" aria-label="Variante de cor da seção" title="Variante de cor (paleta Bootstrap)">' +
            ACCENTS.map(a => '<option value="' + a[0] + '"' + (a[0] === accent ? ' selected' : '') + '>' + a[1] + '<\/option>').join('') +
            '<\/select>' +
            (hasSlots ? '<button type="button" class="btn btn-sm btn-light" data-act="icon" title="Inserir ícone">' + icon('star') + ' Ícone<\/button>' : '') +
            '<button type="button" class="btn btn-sm btn-light" data-act="up" title="Mover para cima" aria-label="Mover para cima">' + icon('arrow-up') + '<\/button>' +
            '<button type="button" class="btn btn-sm btn-light" data-act="down" title="Mover para baixo" aria-label="Mover para baixo">' + icon('arrow-down') + '<\/button>' +
            '<button type="button" class="btn btn-sm btn-light" data-act="dup" title="Duplicar" aria-label="Duplicar seção">' + icon('copy') + '<\/button>' +
            '<button type="button" class="btn btn-sm btn-danger" data-act="del" title="Remover" aria-label="Remover seção">' + icon('trash') + '<\/button>';
        return t;
    }

    /** Cria o wrapper de bloco (toolbar + marcação da seção). */
    function createBlock(root, meta) {
        const d = COMP_MAP.get(meta.comp);
        if (!d) throw new Error('Componente desconhecido: ' + meta.comp);
        prepareRoot(root);
        const w = document.createElement('div');
        w.className = 'vb-block';
        w.dataset.vbUid = meta.uid;
        w.dataset.vbComp = meta.comp;
        w.dataset.vbAccent = meta.accent;
        w.appendChild(buildToolbar(d, !!root.querySelector('[data-vb-icon-slot]'), meta.accent));
        w.appendChild(root);
        return w;
    }

    /** Registro serializável de um bloco (usado em rascunho, desfazer e duplicar). */
    function snapshot(w) {
        return {
            comp: w.dataset.vbComp,
            uid: w.dataset.vbUid,
            accent: w.dataset.vbAccent || 'primary',
            html: cleanClone(rootOf(w), { keepSlots: true }).outerHTML
        };
    }

    /** Recria um bloco a partir de um registro, validando tudo (proteção contra dados inválidos). */
    function blockFromRecord(rec) {
        if (!rec || typeof rec.comp !== 'string' || !COMP_MAP.has(rec.comp) ||
            typeof rec.html !== 'string' || rec.html.length > 300000) throw new Error('Registro inválido');
        const root = parseRoot(rec.html);
        sanitize(root);
        const uid = newUid();
        if (typeof rec.uid === 'string') retargetIds(root, rec.uid, uid);
        const accent = ACCENT_IDS.includes(rec.accent) ? rec.accent : 'primary';
        return createBlock(root, { comp: rec.comp, uid, accent });
    }

    function refreshUI() {
        const n = getBlocks().length;
        wrap.classList.toggle('vb-is-empty', n === 0);
        $('blockCount').textContent = n + (n === 1 ? ' seção' : ' seções');
        $('exportBtn').disabled = n === 0;
        $('clearBtn').disabled = n === 0;
    }

    function insertBlock(w, index) {
        const ref = canvas.children[index] || null;
        canvas.insertBefore(w, ref);
        refreshUI();
    }

    function selectBlock(w) {
        if (state.selected && state.selected !== w) state.selected.classList.remove('vb-selected');
        state.selected = w || null;
        if (w) w.classList.add('vb-selected');
    }

    /** Adiciona um componente da biblioteca ao canvas. */
    function addComponent(id, index, opts) {
        if (getBlocks().length >= MAX_BLOCKS) { toast('Limite de ' + MAX_BLOCKS + ' seções atingido.', 'danger'); return null; }
        const d = COMP_MAP.get(id);
        if (!d) { toast('Componente desconhecido.', 'danger'); return null; }
        if (state.preview) setPreview(false);
        try {
            const uid = newUid();
            const root = parseRoot(d.html.split(U).join(uid));
            sanitize(root);
            const w = createBlock(root, { comp: id, uid, accent: 'primary' });
            insertBlock(w, typeof index === 'number' ? index : getBlocks().length);
            selectBlock(w);
            if (opts && opts.scroll) w.scrollIntoView({ behavior: 'smooth', block: 'center' });
            scheduleSave();
            return w;
        } catch (err) {
            console.error(err);
            toast('Não foi possível adicionar o componente.', 'danger');
            return null;
        }
    }

    function moveBlock(w, index) {
        if (!w || !w.isConnected) return;
        const ref = getBlocks()[index] || null;
        if (ref === w) return;
        canvas.insertBefore(w, ref);
        selectBlock(w);
        scheduleSave();
    }

    function shiftBlock(w, dir) {
        const blocks = getBlocks();
        const i = blocks.indexOf(w);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= blocks.length) return;
        if (dir < 0) canvas.insertBefore(w, blocks[j]);
        else canvas.insertBefore(blocks[j], w);
        w.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        scheduleSave();
    }

    function duplicateBlock(w) {
        if (getBlocks().length >= MAX_BLOCKS) { toast('Limite de ' + MAX_BLOCKS + ' seções atingido.', 'danger'); return; }
        try {
            const copy = blockFromRecord(snapshot(w));
            w.after(copy);
            refreshUI();
            selectBlock(copy);
            scheduleSave();
        } catch (err) {
            console.error(err);
            toast('Não foi possível duplicar a seção.', 'danger');
        }
    }

    function removeBlock(w) {
        const idx = getBlocks().indexOf(w);
        if (idx < 0) return;
        const rec = snapshot(w);
        closePicker();
        if (state.selected === w) state.selected = null;
        w.remove();
        refreshUI();
        scheduleSave();
        toast('Seção removida.', 'dark', {
            label: 'Desfazer',
            run: () => {
                try { insertBlock(blockFromRecord(rec), idx); scheduleSave(); }
                catch (e) { toast('Não foi possível desfazer.', 'danger'); }
            }
        });
    }

    /** Troca a variante de cor da seção, substituindo as classes Bootstrap de cor (btn-*, text-bg-*, bg-*-subtle…). */
    function applyAccent(w, next) {
        if (!ACCENT_IDS.includes(next)) return;
        const prev = w.dataset.vbAccent || 'primary';
        if (prev === next) return;
        const root = rootOf(w);
        const all = [root, ...root.querySelectorAll('*')].filter(el => !(el instanceof SVGElement));
        all.forEach(el => {
            Array.from(el.classList).forEach(cls => {
                const m = ACCENT_RE.exec(cls);
                if (m && m[2] === prev) el.classList.replace(cls, m[1] + '-' + next + (m[3] || ''));
            });
        });
        // Mantém contraste: fundos claros (warning/info) pedem texto escuro
        all.forEach(el => {
            if (el.hasAttribute('data-bs-theme') && el.classList.contains('bg-' + next)) {
                el.setAttribute('data-bs-theme', (next === 'warning' || next === 'info') ? 'light' : 'dark');
            }
        });
        w.dataset.vbAccent = next;
        const sel = w.querySelector('select[data-act="accent"]');
        if (sel) sel.value = next;
        scheduleSave();
    }

    /* =====================================================================
       7. BIBLIOTECA LATERAL (renderização, busca, clique para adicionar)
       ===================================================================== */
    function buildLibrary() {
        const host = $('library');
        host.innerHTML = '';
        let n = 0;
        CATEGORIES.forEach((cat, ci) => {
            const items = COMPONENTS.filter(c => c.cat === cat.id);
            if (!items.length) return;
            const acc = document.createElement('div');
            acc.className = 'accordion-item';
            acc.dataset.cat = cat.id;
            const hid = 'cat-h-' + cat.id, cid = 'cat-c-' + cat.id;
            acc.innerHTML =
                '<h2 class="accordion-header" id="' + hid + '"><button class="accordion-button' + (ci ? ' collapsed' : '') + '" type="button" data-bs-toggle="collapse" data-bs-target="#' + cid + '" aria-expanded="' + (ci === 0) + '" aria-controls="' + cid + '">' +
                cat.name + ' <span class="badge text-bg-secondary ms-2">' + items.length + '<\/span><\/button><\/h2>' +
                '<div id="' + cid + '" class="accordion-collapse collapse' + (ci ? '' : ' show') + '" aria-labelledby="' + hid + '"><div class="accordion-body p-3"><\/div><\/div>';
            const body = acc.querySelector('.accordion-body');
            items.forEach(d => {
                const item = document.createElement('div');
                item.className = 'vb-lib-item';
                item.draggable = true;
                item.tabIndex = 0;
                item.dataset.comp = d.id;
                item.setAttribute('role', 'button');
                item.setAttribute('aria-label', 'Adicionar ' + d.name);
                const prev = document.createElement('div');
                prev.className = 'vb-lib-preview';
                const scale = document.createElement('div');
                scale.className = 'vb-lib-scale';
                scale.inert = true;
                scale.setAttribute('aria-hidden', 'true');
                scale.innerHTML = d.html.split(U).join('lib' + (n++)); // ids únicos também na miniatura
                prev.appendChild(scale);
                const foot = document.createElement('div');
                foot.className = 'd-flex justify-content-between align-items-center gap-2 px-2 py-1';
                foot.innerHTML = '<span class="small fw-medium text-truncate"><\/span><button type="button" class="btn btn-sm btn-purple py-0 px-2" data-add aria-label="Adicionar ao canvas" title="Adicionar ao canvas">' + icon('plus') + '<\/button>';
                foot.firstChild.textContent = d.name;
                item.appendChild(prev);
                item.appendChild(foot);
                body.appendChild(item);
            });
            host.appendChild(acc);
        });

        host.addEventListener('click', e => {
            const t = elOf(e.target);
            const item = t && t.closest('.vb-lib-item');
            if (item && t.closest('[data-add]')) addComponent(item.dataset.comp, undefined, { scroll: true });
        });
        host.addEventListener('keydown', e => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            const t = elOf(e.target);
            const item = t && t.closest('.vb-lib-item');
            if (item && t === item) { e.preventDefault(); addComponent(item.dataset.comp, undefined, { scroll: true }); }
        });
    }

    function filterLibrary(q) {
        let any = false;
        document.querySelectorAll('#library .accordion-item').forEach((acc, ci) => {
            const catName = (CATEGORIES.find(c => c.id === acc.dataset.cat) || {}).name || '';
            let hits = 0;
            acc.querySelectorAll('.vb-lib-item').forEach(it => {
                const d = COMP_MAP.get(it.dataset.comp);
                const hit = !q || (d.name + ' ' + catName).toLowerCase().includes(q);
                it.hidden = !hit;
                if (hit) hits++;
            });
            acc.hidden = hits === 0;
            if (hits) any = true;
            const open = q ? true : ci === 0; // durante a busca expande tudo; ao limpar, volta ao padrão
            acc.querySelector('.accordion-collapse').classList.toggle('show', open);
            const btn = acc.querySelector('.accordion-button');
            btn.classList.toggle('collapsed', !open);
            btn.setAttribute('aria-expanded', String(open));
        });
        $('libEmpty').hidden = any;
    }

    /* =====================================================================
       8. DRAG AND DROP (HTML5) — com validações de estado
       ===================================================================== */
    document.addEventListener('dragstart', e => {
        const t = elOf(e.target);
        if (!t || !e.dataTransfer) return;
        const item = t.closest('.vb-lib-item');
        if (item && COMP_MAP.has(item.dataset.comp)) {
            state.drag = { type: 'new', id: item.dataset.comp };
            e.dataTransfer.effectAllowed = 'copy';
            e.dataTransfer.setData('text/plain', item.dataset.comp); // Firefox exige algum dado
            return;
        }
        const handle = t.closest('.vb-handle');
        const w = handle && handle.closest('.vb-block');
        if (w) {
            state.drag = { type: 'move', el: w };
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', 'vb-move');
            try { e.dataTransfer.setDragImage(w, 24, 16); } catch (err) { /* opcional */ }
            requestAnimationFrame(() => w.classList.add('vb-dragging'));
        }
    });

    function dropIndex(y) {
        const blocks = getBlocks();
        for (let i = 0; i < blocks.length; i++) {
            const r = blocks[i].getBoundingClientRect();
            if (y < r.top + r.height / 2) return i;
        }
        return blocks.length;
    }

    function showDropIndicator(y) {
        const blocks = getBlocks();
        wrap.classList.add('vb-drag-over');
        if (!blocks.length) { indicator.hidden = true; return; }
        const i = dropIndex(y);
        const wr = wrap.getBoundingClientRect();
        const top = i < blocks.length
            ? blocks[i].getBoundingClientRect().top - wr.top
            : blocks[blocks.length - 1].getBoundingClientRect().bottom - wr.top;
        indicator.style.top = (top - 2) + 'px';
        indicator.hidden = false;
    }

    function autoScroll(y) {
        const r = stage.getBoundingClientRect();
        const edge = 70;
        if (y < r.top + edge) stage.scrollTop -= 18;
        else if (y > r.bottom - edge) stage.scrollTop += 18;
    }

    function endDrag() {
        state.drag = null;
        indicator.hidden = true;
        wrap.classList.remove('vb-drag-over');
        canvas.querySelectorAll('.vb-dragging').forEach(n => n.classList.remove('vb-dragging'));
    }

    stage.addEventListener('dragover', e => {
        if (!state.drag) return; // ignora arrastes externos (arquivos, texto…)
        e.preventDefault();
        e.dataTransfer.dropEffect = state.drag.type === 'new' ? 'copy' : 'move';
        showDropIndicator(e.clientY);
        autoScroll(e.clientY);
    });
    stage.addEventListener('dragleave', e => {
        if (!state.drag) return;
        if (!e.relatedTarget || !stage.contains(e.relatedTarget)) { indicator.hidden = true; wrap.classList.remove('vb-drag-over'); }
    });
    stage.addEventListener('drop', e => {
        if (!state.drag) return;
        e.preventDefault();
        const d = state.drag;
        const idx = dropIndex(e.clientY);
        endDrag();
        if (d.type === 'new') addComponent(d.id, idx);
        else if (d.el && d.el.isConnected) moveBlock(d.el, idx);
    });
    document.addEventListener('dragend', endDrag);
    // Bloqueia soltar texto/arquivos externos dentro de elementos editáveis (evitaria HTML não controlado)
    canvas.addEventListener('drop', e => { if (!state.drag) e.preventDefault(); }, true);

    /* =====================================================================
       9. INTERAÇÕES NO CANVAS (cliques, toolbar, edição inline)
       ===================================================================== */
    canvas.addEventListener('click', e => {
        const t = elOf(e.target);
        if (!t) return;
        const link = t.closest('a');
        if (link) e.preventDefault(); // links do canvas nunca navegam
        const block = t.closest('.vb-block');
        if (!block) return;

        const btn = t.closest('button[data-act]');
        if (btn && block.contains(btn)) {
            const act = btn.dataset.act;
            if (act === 'up') shiftBlock(block, -1);
            else if (act === 'down') shiftBlock(block, 1);
            else if (act === 'dup') duplicateBlock(block);
            else if (act === 'del') removeBlock(block);
            else if (act === 'icon') { const s = block.querySelector('[data-vb-icon-slot]'); if (s) openPicker(s); }
            return;
        }
        selectBlock(block);
        if (!state.preview) {
            const slot = t.closest('[data-vb-icon-slot]');
            if (slot && block.contains(slot)) openPicker(slot);
        }
    });

    canvas.addEventListener('change', e => {
        const t = elOf(e.target);
        if (t && t.matches('select[data-act="accent"]')) {
            const block = t.closest('.vb-block');
            if (block) applyAccent(block, t.value);
        }
    });
    canvas.addEventListener('submit', e => e.preventDefault());

    stage.addEventListener('click', e => {
        const t = elOf(e.target);
        if (t && !t.closest('.vb-block')) selectBlock(null);
    });

    // ---- Edição inline de texto ----
    const editSnapshots = new WeakMap();
    const editableFrom = t => { const el = elOf(t); return el ? el.closest('[contenteditable="true"]') : null; };
    let lastLimitToast = 0;

    /** Remove qualquer marcação inserida pelo navegador, mantendo só texto e <br>. */
    function flatten(el) {
        let n;
        while ((n = el.querySelector(':scope *:not(br)'))) n.replaceWith(...Array.from(n.childNodes));
    }

    function placeCaretEnd(el) {
        const r = document.createRange();
        r.selectNodeContents(el);
        r.collapse(false);
        const s = window.getSelection();
        s.removeAllRanges();
        s.addRange(r);
    }

    function finalizeEdit(el) {
        flatten(el);
        if (!el.querySelector('br')) el.textContent = el.textContent.trim().replace(/\s+/g, ' ');
        if (!el.textContent.trim()) {
            const prev = editSnapshots.get(el);
            if (prev !== undefined) el.innerHTML = prev;
            toast('O texto não pode ficar vazio. Valor anterior restaurado.', 'danger');
        }
        if (el.textContent.length > MAX_TEXT) el.textContent = el.textContent.slice(0, MAX_TEXT);
        scheduleSave();
    }

    canvas.addEventListener('focusin', e => {
        const el = editableFrom(e.target);
        if (el) editSnapshots.set(el, el.innerHTML);
        const b = elOf(e.target) && elOf(e.target).closest('.vb-block');
        if (b) selectBlock(b);
    });
    canvas.addEventListener('focusout', e => {
        const el = editableFrom(e.target);
        if (el) finalizeEdit(el);
    });
    canvas.addEventListener('input', e => {
        const el = editableFrom(e.target);
        if (!el) return;
        if (el.textContent.length > MAX_TEXT) {
            el.textContent = el.textContent.slice(0, MAX_TEXT);
            placeCaretEnd(el);
            if (Date.now() - lastLimitToast > 2000) { lastLimitToast = Date.now(); toast('Limite de ' + MAX_TEXT + ' caracteres por texto.', 'danger'); }
        }
        scheduleSave();
    });
    canvas.addEventListener('keydown', e => {
        const el = editableFrom(e.target);
        if (!el) return;
        if (e.key === 'Enter') {
            // Evita que o navegador crie <div>/<p> dentro de títulos, links e botões
            const allowBreak = e.shiftKey && (el.tagName === 'P' || el.tagName === 'BLOCKQUOTE');
            if (!allowBreak) { e.preventDefault(); el.blur(); }
        } else if (e.key === 'Escape') {
            el.blur();
        } else if ((e.ctrlKey || e.metaKey) && ['b', 'i', 'u'].includes(e.key.toLowerCase())) {
            e.preventDefault(); // sem formatação rica: só texto
        }
    });
    canvas.addEventListener('paste', e => {
        const el = editableFrom(e.target);
        if (!el) return;
        e.preventDefault();
        const raw = (e.clipboardData || window.clipboardData).getData('text/plain') || '';
        const text = raw.replace(/\s*[\r\n]+\s*/g, ' ');
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount || !text) return;
        const r = sel.getRangeAt(0);
        r.deleteContents();
        const node = document.createTextNode(text);
        r.insertNode(node);
        r.setStartAfter(node);
        r.collapse(true);
        sel.removeAllRanges();
        sel.addRange(r);
        el.dispatchEvent(new Event('input', { bubbles: true }));
    });

    /* =====================================================================
       10. SELETOR DE ÍCONES
       ===================================================================== */
    function buildPicker() {
        const grid = $('pickerGrid');
        PICKER_ICONS.forEach(name => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'vb-icon-btn';
            b.dataset.icon = name;
            b.title = ICON_LABELS[name];
            b.setAttribute('aria-label', ICON_LABELS[name]);
            b.innerHTML = icon(name);
            grid.appendChild(b);
        });
        grid.addEventListener('click', e => {
            const b = elOf(e.target) && elOf(e.target).closest('.vb-icon-btn');
            if (b) pickIcon(b.dataset.icon);
        });
        $('pickerClear').addEventListener('click', () => {
            const s = state.slot;
            if (s && s.isConnected) { s.innerHTML = ''; scheduleSave(); }
            closePicker();
        });
        $('pickerClose').addEventListener('click', closePicker);
    }

    function openPicker(slot) {
        state.slot = slot;
        $('pickerHint').textContent = slot.hasAttribute('data-vb-multi')
            ? 'Cada clique adiciona um ícone ao grupo.'
            : 'O ícone escolhido substitui o atual.';
        picker.hidden = false;
        const r = slot.getBoundingClientRect();
        const pw = picker.offsetWidth, ph = picker.offsetHeight;
        const left = Math.max(8, Math.min(r.left, window.innerWidth - pw - 8));
        let top = r.bottom + 8;
        if (top + ph > window.innerHeight - 8) top = Math.max(8, r.top - ph - 8);
        picker.style.left = left + 'px';
        picker.style.top = top + 'px';
    }

    function closePicker() { picker.hidden = true; state.slot = null; }

    function pickIcon(name) {
        const s = state.slot;
        if (!s || !s.isConnected || !ICON_PATHS[name]) { closePicker(); return; }
        if (s.hasAttribute('data-vb-multi')) {
            if (s.querySelectorAll('svg').length >= MAX_ICONS_PER_SLOT) { toast('Máximo de ' + MAX_ICONS_PER_SLOT + ' ícones neste grupo.', 'danger'); return; }
            s.insertAdjacentHTML('beforeend', icon(name));
        } else {
            s.innerHTML = icon(name);
        }
        closePicker();
        scheduleSave();
    }

    document.addEventListener('mousedown', e => {
        if (picker.hidden) return;
        const t = elOf(e.target);
        if (!t || picker.contains(t) || t.closest('[data-vb-icon-slot]') || t.closest('[data-act="icon"]')) return;
        closePicker();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !picker.hidden) closePicker(); });

    /* =====================================================================
       11. MODO PRÉ-VISUALIZAÇÃO
       ===================================================================== */
    function setPreview(on) {
        state.preview = on;
        document.body.classList.toggle('vb-preview', on);
        $('previewSwitch').checked = on;
        canvas.querySelectorAll('.vb-editable').forEach(el => el.setAttribute('contenteditable', on ? 'false' : 'true'));
        closePicker();
        if (on) { selectBlock(null); if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); }
    }

    /* =====================================================================
       12. EXPORTAÇÃO (HTML limpo + modal + cópia com um clique)
       ===================================================================== */

    /** Serializa um elemento com indentação. Texto misto/inline fica numa linha; SVG sempre inline. */
    function formatNode(el, depth, out) {
        const pad = '  '.repeat(depth);
        const tag = el.tagName.toLowerCase();
        const hasEl = el.children.length > 0;
        const hasText = Array.from(el.childNodes).some(n => n.nodeType === 3 && n.textContent.trim());
        if (tag === 'svg' || !hasEl || hasText || VOID.has(tag)) {
            out.push(pad + el.outerHTML.replace(/\s*\n\s*/g, ' '));
            return;
        }
        const shallow = el.cloneNode(false).outerHTML;
        out.push(pad + shallow.slice(0, shallow.length - ('<\/' + tag + '>').length));
        Array.from(el.children).forEach(c => formatNode(c, depth + 1, out));
        out.push(pad + '<\/' + tag + '>');
    }

    /** Garante que nenhum rastro do construtor vazou para o HTML final. */
    function assertClean(html) {
        const doc = new DOMParser().parseFromString('<body>' + html + '<\/body>', 'text/html');
        const bad = Array.from(doc.body.querySelectorAll('*')).find(el =>
            Array.from(el.attributes).some(a => a.name === 'contenteditable' || a.name === 'draggable' || a.name.startsWith('data-vb')) ||
            Array.from(el.classList).some(c => c.startsWith('vb-')));
        if (bad) throw new Error('A exportação encontrou atributos internos do construtor.');
    }

    /** Escapa texto para uso seguro dentro de atributos/elementos HTML. */
    function escHtml(s) {
        return String(s).replace(/&/g, '&amp;').replace(/\x3C/g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    /** Título da página informado no modal (validado: sem vazio, máx. 80 caracteres). */
    function pageTitle() {
        const v = ($('pageTitle').value || '').trim().slice(0, 80);
        return v || 'Minha landing page';
    }

    function buildExport(full) {
        const blocks = getBlocks();
        if (!blocks.length) throw new Error('Adicione ao menos uma seção antes de exportar.');
        const lines = [];
        blocks.forEach((w, i) => {
            formatNode(cleanClone(rootOf(w)), 0, lines);
            if (i < blocks.length - 1) lines.push('');
        });
        const body = lines.join('\n');
        assertClean(body);
        if (!full) return body;
        const indented = lines.map(l => (l ? '    ' + l : l)).join('\n');
        // data-bs-theme="light" garante o mesmo visual do canvas, independentemente do tema do sistema/projeto
        return '<!DOCTYPE html>\n<html lang="pt-BR" data-bs-theme="light">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n' +
            '  <title>' + escHtml(pageTitle()) + '<\/title>\n' +
            '  <link href="https://cdn.jsdelivr.net/npm/bootstrap@' + BS_VERSION + '/dist/css/bootstrap.min.css" rel="stylesheet">\n<\/head>\n<body>\n' +
            indented + '\n\n  <script src="https://cdn.jsdelivr.net/npm/bootstrap@' + BS_VERSION + '/dist/js/bootstrap.bundle.min.js"><\/script>\n<\/body>\n<\/html>\n';
    }

    function renderExport() {
        const ta = $('exportCode');
        try {
            const code = buildExport($('fullDoc').checked);
            ta.value = code;
            const kb = (new Blob([code]).size / 1024).toFixed(1);
            $('exportInfo').textContent = getBlocks().length + ' seção(ões) · ' + code.split('\n').length + ' linhas · ' + kb + ' KB';
            return true;
        } catch (err) {
            toast(err.message || 'Falha ao gerar o HTML.', 'danger');
            return false;
        }
    }

    async function copyText(text, ta) {
        if (navigator.clipboard && window.isSecureContext) {
            try { await navigator.clipboard.writeText(text); return true; } catch (err) { /* tenta o fallback */ }
        }
        try { ta.focus(); ta.select(); return document.execCommand('copy'); } catch (err) { return false; }
    }

    function initExport() {
        $('exportBtn').addEventListener('click', () => {
            if (!window.bootstrap) { toast('Bootstrap não carregou; não é possível abrir o modal.', 'danger'); return; }
            if (!renderExport()) return;
            bootstrap.Modal.getOrCreateInstance($('exportModal')).show();
        });
        $('fullDoc').addEventListener('change', renderExport);
        $('pageTitle').addEventListener('input', renderExport);
        $('copyBtn').addEventListener('click', async () => {
            const ta = $('exportCode');
            const btn = $('copyBtn');
            const ok = await copyText(ta.value, ta);
            if (ok) {
                const old = btn.textContent;
                btn.textContent = 'Copiado!';
                setTimeout(() => { btn.textContent = old; }, 1600);
                toast('HTML copiado para a área de transferência.', 'success');
            } else {
                ta.select();
                toast('Não foi possível copiar automaticamente. Use Ctrl+C com o texto selecionado.', 'danger');
            }
        });
        $('downloadBtn').addEventListener('click', () => {
            try {
                const blob = new Blob([buildExport(true)], { type: 'text/html;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'landing-page.html';
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            } catch (err) { toast(err.message || 'Falha ao baixar o arquivo.', 'danger'); }
        });
    }

    /* =====================================================================
       13. RASCUNHO AUTOMÁTICO (localStorage, com tratamento de falhas)
       ===================================================================== */
    let saveTimer = null;
    function scheduleSave() { clearTimeout(saveTimer); saveTimer = setTimeout(saveDraft, 400); }
    function saveDraft() {
        try {
            const recs = getBlocks().map(snapshot);
            if (!recs.length) localStorage.removeItem(STORAGE_KEY);
            else localStorage.setItem(STORAGE_KEY, JSON.stringify(recs));
        } catch (err) { /* armazenamento cheio ou bloqueado: o construtor segue funcionando */ }
    }
    function loadDraft() {
        let raw = null;
        try { raw = localStorage.getItem(STORAGE_KEY); } catch (err) { return; }
        if (!raw) return;
        try {
            const arr = JSON.parse(raw);
            if (!Array.isArray(arr)) return;
            let ok = 0;
            arr.slice(0, MAX_BLOCKS).forEach(rec => {
                try { canvas.appendChild(blockFromRecord(rec)); ok++; } catch (err) { /* ignora registros inválidos */ }
            });
            refreshUI();
            if (ok) toast('Rascunho anterior restaurado.', 'primary');
        } catch (err) {
            try { localStorage.removeItem(STORAGE_KEY); } catch (e2) { /* nada a fazer */ }
        }
    }
    window.addEventListener('pagehide', saveDraft);

    /* =====================================================================
       14. INICIALIZAÇÃO
       ===================================================================== */
    function init() {
        if (!window.bootstrap) $('cdnAlert').hidden = false;
        $('emptyIcon').innerHTML = icon('layers');

        buildLibrary();
        buildPicker();
        initExport();

        $('libSearch').addEventListener('input', e => filterLibrary(e.target.value.trim().toLowerCase()));
        $('previewSwitch').addEventListener('change', e => setPreview(e.target.checked));
        $('clearBtn').addEventListener('click', async () => {
            const recs = getBlocks().map(snapshot);
            if (!recs.length) return;
            const ok = await confirmDialog('Remover todas as ' + recs.length + ' seções do canvas?');
            if (!ok) return;
            closePicker();
            state.selected = null;
            canvas.innerHTML = '';
            refreshUI();
            saveDraft();
            toast('Canvas limpo.', 'dark', {
                label: 'Desfazer',
                run: () => {
                    recs.forEach(r => { try { canvas.appendChild(blockFromRecord(r)); } catch (e) { /* ignora */ } });
                    refreshUI();
                    scheduleSave();
                }
            });
        });

        refreshUI();
        loadDraft();
    }

    init();
})();
