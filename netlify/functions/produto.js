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
    const url = `https://edsongaiolas.netlify.app/.netlify/functions/produto?id=${encodeURIComponent(id)}`;

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
<h1>${escapeHtml(nome)}</h1>
<p>${escapeHtml(descricao)}</p>
${imagem ? `<img src="${escapeHtml(imagem)}" alt="${escapeHtml(nome)}" style="max-width:100%;">` : ""}
</body>
</html>`
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
