export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { items, name, email, phone, order_nsu, redirect_url } = req.body;

    const payload = {
      handle: "luxuryparfumce",
      order_nsu: order_nsu || `KR-${Date.now()}`,
      redirect_url: redirect_url || "https://casamento-karinne-rogerio.vercel.app/?pagamento=confirmado",
      items: items, // valores já em centavos, com taxa repassada
    };

    // Inclui dados do cliente se informados (agiliza o checkout)
    if (name || email || phone) {
      payload.customer = {};
      if (name)  payload.customer.name         = name;
      if (email) payload.customer.email        = email;
      if (phone) payload.customer.phone_number = phone;
    }

    const response = await fetch("https://api.checkout.infinitepay.io/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("InfinitePay response:", JSON.stringify(data));

    // A API retorna "url", não "payment_url"
    return res.status(response.status).json(data);

  } catch (err) {
    console.error("Erro:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
