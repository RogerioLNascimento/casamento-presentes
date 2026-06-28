export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const valor = Number(req.query.valor || 1000);
      const descricao = req.query.descricao || "Presente de casamento";
      const quantidade = Number(req.query.quantidade || 1);

      const payload = {
        handle: "luxuryparfumce",
        redirect_url: "https://casamento-presentes-kappa.vercel.app",
        order_nsu: "pedido-" + Date.now(),
        items: [
          {
            quantity: quantidade,
            price: valor * 100,
            description: descricao
          }
        ]
      };

      const response = await fetch("https://api.checkout.infinitepay.io/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data && data.url) {
        res.writeHead(302, { Location: data.url });
        return res.end();
      }

      return res.status(400).json({
        error: "A InfinitePay não retornou o link.",
        resposta: data
      });
    }

    if (req.method === "POST") {
      const response = await fetch("https://api.checkout.infinitepay.io/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(req.body)
      });

      const data = await response.json();

      return res.status(response.status).json(data);
    }

    return res.status(405).json({
      error: "Method Not Allowed"
    });

  } catch (err) {
    return res.status(500).json({
      error: "Erro ao gerar link de pagamento",
      details: err.message
    });
  }
}
