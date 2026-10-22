exports.handler = async function(event) {
  const id = event.queryStringParameters?.id || event.path?.split("/").pop();

  if (!id) {
    return {
      statusCode: 400,
      headers: {"Content-Type": "text/html; charset=utf-8"},
      body: "<h1>Produto não informado.</h1>"
    };
  }

  const SUPABASE_URL = "https://zjykakrtaatfnijfkueh.supabase.co";
  const SUPABASE_KEY = "sb_publishable_EhqZH52Fr45qSa6p-W4DmQ_xYefivQy";

  try {
    const resposta = await fetch(
      `${SUPABASE_URL}/rest/v1/produtos?select=*&id=eq.${encodeURIComponent(id)}&visivel=eq.true`,
      {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!resposta.ok) {
      throw new Error(`Supabase respondeu ${resposta.status}`);
    }

    const produtos = await resposta.json();
    const produto = produtos[0];

    if (!produto) {
      return {
        statusCode: 404,
        headers: {"Content-Type": "text/html; charset=utf-8"},
        body: "<h1>Produto não encontrado.</h1>"
      };
    }

    const nome = String(produto.nome || "Produto");
    const descricao = String(produto.descricao || "");
    const imagem = String(produto.foto_url || "");
    const url = `https://edsongaiolas.netlify.app/produto/${encodeURIComponent(id)}`;
    const modelo = String(produto.modelo || "");
    const preco = new Intl.NumberFormat("pt-BR", {style:"currency", currency:"BRL"}).format(Number(produto.preco || 0));
    const textoWhatsApp = "Olá! Tenho interesse neste produto.\n\nNome: " + nome + "\nDescrição: " + descricao + "\nValor: " + preco + "\n\nVeja o produto: " + url;
    const whatsapp = "https://wa.me/5588981919808?text=" + encodeURIComponent(textoWhatsApp);

    const escapeHtml = (texto) =>
      texto.replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[caractere]));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300"
      },
      body: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHtml(nome)}">
<meta property="og:description" content="${escapeHtml(descricao)}">
<meta property="og:image" content="${escapeHtml(imagem)}">
<meta property="og:url" content="${escapeHtml(url)}">
<meta name="twitter:card" content="summary_large_image">
<title>${escapeHtml(nome)}</title>
</head>
<body>
<style>
*{box-sizing:border-box}
body{margin:0;background:#f7f5f0;color:#2d2a26;font-family:Arial,sans-serif}
.page{min-height:100vh}
.top{background:#fff;border-bottom:1px solid #e5e0d8}
.topbar{max-width:1180px;margin:auto;padding:22px 20px;display:flex;align-items:center;justify-content:space-between;gap:20px}
.brand{font-size:24px;font-weight:800;text-decoration:none;color:#2d2a26}
.back{font-size:14px;color:#2d2a26;text-decoration:none}
.back:hover{text-decoration:underline}
.product{max-width:1180px;margin:0 auto;padding:55px 20px 70px;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(340px,.95fr);gap:55px;align-items:center}
.photo{background:#e3ebdf;border-radius:18px;padding:18px;display:flex;align-items:center;justify-content:center;min-height:520px}
.photo img{display:block;width:100%;height:100%;max-height:620px;object-fit:contain;border-radius:12px}
.info{padding:10px 0}
.model{margin:0 0 10px;color:#777;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
h1{margin:0 0 18px;font-size:clamp(34px,5vw,54px);line-height:1.05;letter-spacing:-.03em}
.description{margin:0 0 28px;color:#666;font-size:17px;line-height:1.7}
.price{margin:0 0 28px;font-size:32px;font-weight:800}
.whatsapp{display:inline-flex;align-items:center;justify-content:center;width:100%;max-width:360px;padding:16px 22px;border-radius:10px;background:#238636;color:#fff;text-decoration:none;font-size:16px;font-weight:700}
.whatsapp:hover{opacity:.92}
@media(max-width:800px){.topbar{padding:18px 15px}.brand{font-size:21px}.product{grid-template-columns:1fr;padding:30px 15px 50px;gap:30px}.photo{min-height:0;padding:10px}.photo img{max-height:500px}h1{font-size:38px}}
</style>
<div class="page">
<header class="top"><div class="topbar"><a class="brand" href="/">Edson Gaiolas</a><a class="back" href="/#catalogo">← Ver produtos</a></div></header>
<main class="product">
<div class="photo">${imagem ? "<img src=\"" + escapeHtml(imagem) + "\" alt=\"" + escapeHtml(nome) + "\">" : ""}</div>
<section class="info">
${modelo ? "<p class=\"model\">" + escapeHtml(modelo) + "</p>" : ""}
<h1>${escapeHtml(nome)}</h1>
<p class="description">${escapeHtml(descricao)}</p>
<p class="price">${escapeHtml(preco)}</p>
<a class="whatsapp" href="${escapeHtml(whatsapp)}" target="_blank" rel="noopener">Falar sobre este produto no WhatsApp</a>
</section>
</main>
</div>
</body>
</html>
`
    };
  } catch (erro) {
    console.error(erro);

    return {
      statusCode: 500,
      headers: {"Content-Type": "text/html; charset=utf-8"},
      body: "<h1>Não foi possível carregar o produto.</h1>"
    };
  }
};
