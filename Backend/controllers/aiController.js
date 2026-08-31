const { GoogleGenerativeAI } = require("@google/generative-ai");
const Product = require("../model/Product");
const Order = require("../model/order");

// Google Gemini Function Declarations (Tools)
const GEMINI_TOOLS = [
  {
    functionDeclarations: [
      {
        name: "search_products",
        description: "Search the ShopSphere catalog by query term, category, or maximum price in INR (₹). Returns matching products with images, prices, and stock.",
        parameters: {
          type: "OBJECT",
          properties: {
            query: {
              type: "STRING",
              description: "Search keyword e.g. 'backpack', 'duffle', 'headphones', 'matte black', 'cabin luggage'"
            },
            category: {
              type: "STRING",
              description: "Category filter: 'accessories' (Bags & Carry), 'travel' (Cabin Luggage), 'electronics' (Audio & Tech), 'home' (Living & Studio)"
            },
            maxPrice: {
              type: "NUMBER",
              description: "Maximum price in INR (₹)"
            },
            limit: {
              type: "NUMBER",
              description: "Maximum products to return (default 4)"
            }
          }
        }
      },
      {
        name: "get_product_details",
        description: "Retrieve comprehensive specifications, warranty, materials, and stock count for a specific product by ID or name.",
        parameters: {
          type: "OBJECT",
          properties: {
            productId: {
              type: "STRING",
              description: "The product MongoDB ObjectId"
            },
            productName: {
              type: "STRING",
              description: "The exact or approximate product name"
            }
          }
        }
      },
      {
        name: "get_user_orders",
        description: "Fetch the logged-in customer's active and past purchase history with items, total amounts, and delivery tracking status.",
        parameters: {
          type: "OBJECT",
          properties: {
            limit: {
              type: "NUMBER",
              description: "Number of recent orders to fetch (default 5)"
            }
          }
        }
      },
      {
        name: "track_order",
        description: "Look up real-time shipping carrier and status for a specific Order ID.",
        parameters: {
          type: "OBJECT",
          properties: {
            orderId: {
              type: "STRING",
              description: "The Order ID or trailing 8 characters"
            }
          },
          required: ["orderId"]
        }
      },
      {
        name: "add_to_cart_action",
        description: "Proactively add a selected product to the user's shopping bag.",
        parameters: {
          type: "OBJECT",
          properties: {
            productId: {
              type: "STRING",
              description: "MongoDB ObjectId of the product"
            },
            quantity: {
              type: "NUMBER",
              description: "Quantity to add (default 1)"
            },
            productName: {
              type: "STRING",
              description: "Name of the product being added"
            }
          },
          required: ["productId"]
        }
      },
      {
        name: "cancel_order",
        description: "Cancel a customer order if it is in pending or processing status and initiate refund. Explains why if already shipped.",
        parameters: {
          type: "OBJECT",
          properties: {
            orderId: {
              type: "STRING",
              description: "The 8-character or 24-character Order ID to cancel"
            }
          },
          required: ["orderId"]
        }
      },
      {
        name: "get_store_policy",
        description: "Retrieve official ShopSphere India policies on Shipping, Returns & Exchanges, Lifetime/Hardware Warranty, or Payment methods.",
        parameters: {
          type: "OBJECT",
          properties: {
            topic: {
              type: "STRING",
              description: "The store policy topic: 'shipping', 'returns', 'warranty', 'payments', or 'all'"
            }
          },
          required: ["topic"]
        }
      }
    ]
  }
];

const SEED_CATALOG = [
  {
    _id: "1",
    name: "The Weekender Duffle Bag",
    brand: "ShopSphere Carry",
    price: 4999,
    originalPrice: 6999,
    category: "accessories",
    rating: 4.9,
    imageURL: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    features: ["Waterproof reinforced canvas", "Dedicated ventilated shoe compartment", "YKK antique brass zippers"],
    inStock: true
  },
  {
    _id: "2",
    name: "Carry-On Pro Hard Shell Trolley",
    brand: "Sphere Luggage",
    price: 8999,
    originalPrice: 11999,
    category: "travel",
    rating: 4.8,
    imageURL: "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&w=800&q=80",
    features: ["German Bayer Polycarbonate", "360° Hinomoto whisper-quiet spinner wheels", "Built-in TSA lock"],
    inStock: true
  },
  {
    _id: "3",
    name: "Nomad Tech Commuter Backpack",
    brand: "Sphere Living",
    price: 3499,
    originalPrice: 4999,
    category: "accessories",
    rating: 4.9,
    imageURL: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80",
    features: ["16-inch padded laptop sleeve", "Waterproof ballistic nylon", "Luggage pass-through strap"],
    inStock: true
  },
  {
    _id: "4",
    name: "Acoustic Silence ANC Headphones",
    brand: "SonicSphere",
    price: 14999,
    originalPrice: 19999,
    category: "electronics",
    rating: 4.9,
    imageURL: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    features: ["Hybrid Active Noise Cancellation", "40-hour battery life", "Hi-Res spatial audio"],
    inStock: true
  },
  {
    _id: "5",
    name: "Zenith Porcelain Aroma Diffuser",
    brand: "Sphere Studio",
    price: 2299,
    originalPrice: 3299,
    category: "home",
    rating: 4.7,
    imageURL: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80",
    features: ["Ultrasonic cool mist", "Handcrafted matte ceramic cover", "Warm ambient LED glow"],
    inStock: true
  }
];

// Tool Execution Handlers
async function executeTool(name, input = {}, reqUser = null) {
  switch (name) {
    case "search_products": {
      const { query, category, maxPrice, limit = 4 } = input;
      let matched = [];

      try {
        let filter = { status: "active" };
        if (category && category !== "all") filter.category = new RegExp(category, "i");
        if (maxPrice && !isNaN(maxPrice)) filter.price = { $lte: Number(maxPrice) };
        if (query && query.trim()) {
          const regex = new RegExp(query.trim(), "i");
          filter.$or = [
            { name: regex },
            { brand: regex },
            { description: regex },
            { category: regex },
            { features: { $in: [regex] } }
          ];
        }
        const dbProducts = await Product.find(filter).limit(Number(limit) || 4).lean();
        if (dbProducts && dbProducts.length > 0) {
          matched = dbProducts.map(p => ({
            _id: p._id,
            name: p.name,
            brand: p.brand,
            price: p.price,
            originalPrice: p.originalPrice,
            category: p.category,
            rating: p.rating || 4.8,
            imageURL: p.imageURL,
            features: p.features?.slice(0, 3),
            inStock: p.countInStock > 0
          }));
        }
      } catch (err) {
        // DB fallback
      }

      // If DB returned nothing, fallback to SEED_CATALOG
      if (matched.length === 0) {
        const rawQ = (query || "").toLowerCase();
        const stopWords = new Set(["suggest", "show", "me", "the", "a", "an", "find", "best", "top", "under", "for", "please", "can", "you", "durable", "premium"]);
        const keywords = rawQ.split(/[\s,]+/).filter(w => w.length >= 3 && !stopWords.has(w));
        const cat = (category || "").toLowerCase();

        matched = SEED_CATALOG.filter(p => {
          const pText = `${p.name} ${p.brand} ${p.category} ${p.features.join(" ")}`.toLowerCase();
          const matchKeywords = keywords.length === 0 || keywords.some(k => pText.includes(k));
          const matchCat = !cat || cat === "all" || p.category.toLowerCase() === cat;
          const matchPrice = !maxPrice || p.price <= Number(maxPrice);
          return matchKeywords && matchCat && matchPrice;
        }).slice(0, Number(limit) || 4);

        if (matched.length === 0) {
          matched = SEED_CATALOG.slice(0, Number(limit) || 4);
        }
      }

      return {
        count: matched.length,
        products: matched
      };
    }

    case "get_product_details": {
      const { productId, productName } = input;
      let product = null;

      if (productId) {
        product = await Product.findById(productId).lean();
      } else if (productName) {
        product = await Product.findOne({ name: new RegExp(productName.trim(), "i") }).lean();
      }

      if (!product) {
        return { found: false, message: "Product not found in catalog." };
      }

      return {
        found: true,
        product: {
          _id: product._id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          description: product.description,
          category: product.category,
          features: product.features,
          specifications: product.specifications,
          imageURL: product.imageURL,
          rating: product.rating || 4.9,
          countInStock: product.countInStock,
          warranty: product.returnPolicy?.warranty || "1 Year Manufacturer Warranty",
          returnPolicy: product.returnPolicy?.returnWindow || "7-Day Returns & Exchange"
        }
      };
    }

    case "get_user_orders": {
      if (!reqUser) {
        return {
          authenticated: false,
          message: "The customer is currently browsing as a guest. Please advise them to Sign In to track their personal order history."
        };
      }

      const orders = await Order.find({ user: reqUser._id })
        .sort({ createdAt: -1 })
        .limit(input.limit || 5)
        .populate("items.product", "name imageURL price")
        .lean();

      return {
        authenticated: true,
        orderCount: orders.length,
        orders: orders.map(o => ({
          orderId: o._id,
          shortId: o._id.toString().slice(-8).toUpperCase(),
          date: o.createdAt,
          status: o.status,
          totalAmount: o.totalAmount,
          paymentStatus: o.paymentStatus,
          paymentMethod: o.paymentMethod,
          items: o.items.map(it => ({
            name: it.name || it.product?.name,
            quantity: it.quantity,
            price: it.price
          }))
        }))
      };
    }

    case "track_order": {
      const { orderId } = input;
      let query = {};
      if (orderId.length === 24) {
        query._id = orderId;
      } else {
        query.$where = `this._id.toString().toUpperCase().endsWith('${orderId.toUpperCase()}')`;
      }

      const order = await Order.findOne(query).populate("items.product", "name imageURL").lean();
      if (!order) {
        return { found: false, message: `No order matching ID ${orderId} was found.` };
      }

      return {
        found: true,
        orderId: order._id,
        status: order.status,
        date: order.createdAt,
        totalAmount: order.totalAmount,
        carrier: "Bluedart Express Air",
        shippingAddress: `${order.city}, ${order.state} - ${order.pin}`,
        items: order.items.map(i => i.name || i.product?.name)
      };
    }

    case "add_to_cart_action": {
      const { productId, quantity = 1 } = input;
      const product = await Product.findById(productId).lean();
      if (!product) {
        return { success: false, message: "Product not found to add to bag." };
      }

      return {
        success: true,
        action: "ADD_TO_CART",
        product: {
          _id: product._id,
          id: product._id,
          name: product.name,
          price: product.price,
          imageURL: product.imageURL,
          quantity: Number(quantity) || 1
        }
      };
    }

    case "cancel_order": {
      if (!reqUser) {
        return {
          success: false,
          message: "Please sign in to your ShopSphere account to cancel an order."
        };
      }

      const { orderId } = input;
      let order = null;
      if (orderId && orderId.length === 24) {
        order = await Order.findOne({ _id: orderId, user: reqUser._id });
      } else if (orderId) {
        const userOrders = await Order.find({ user: reqUser._id });
        order = userOrders.find(o => o._id.toString().toUpperCase().endsWith(orderId.toUpperCase()));
      }

      if (!order) {
        return {
          success: false,
          message: `Order #${orderId || ""} was not found under your account.`
        };
      }

      if (order.status === "cancelled") {
        return {
          success: false,
          message: `Order #${order._id.toString().slice(-8).toUpperCase()} is already cancelled.`
        };
      }

      if (order.status === "shipped" || order.status === "delivered") {
        return {
          success: false,
          message: `Order #${order._id.toString().slice(-8).toUpperCase()} has already been dispatched via Bluedart Express Air and cannot be cancelled in transit. Once delivered, you may refuse delivery or initiate a hassle-free 7-day doorstep return.`
        };
      }

      // Update status to cancelled
      order.status = "cancelled";
      await order.save();

      // Restore inventory
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          if (item.product) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { countInStock: item.quantity || 1 }
            });
          }
        }
      }

      return {
        success: true,
        message: `Order #${order._id.toString().slice(-8).toUpperCase()} has been successfully cancelled. Your refund of ₹${Number(order.totalAmount).toLocaleString("en-IN")} will be credited to your original payment method within 24-48 business hours.`
      };
    }

    case "get_store_policy": {
      const policies = {
        shipping: "ShopSphere provides complimentary Express Air Delivery across 24,000+ Indian PIN codes on orders above ₹999. Metro deliveries arrive in 2-4 business days.",
        returns: "Hassle-free 7-Day Doorstep Returns & Exchanges on all unused products with tags intact. Instant refund processing upon quality check.",
        warranty: "Polycarbonate luggage includes a 3-Year Limited Hardware Warranty. Technical carry bags and acoustic gear include 1-Year Full Coverage.",
        payments: "256-bit SSL encrypted checkout via Razorpay (UPI, Google Pay, PhonePe, Paytm, Credit/Debit Cards, NetBanking, and Cash on Delivery up to ₹25,000)."
      };

      if (input.topic === "all") return policies;
      return { topic: input.topic, policy: policies[input.topic] || policies.shipping };
    }

    default:
      return { error: `Unknown tool name: ${name}` };
  }
}

// Simulated Smart Fallback if GEMINI_API_KEY is not yet set in .env
async function handleFallbackChat(messages, reqUser) {
  const lastUserMsg = messages.filter(m => m.role === "user").slice(-1)[0]?.content || "";
  const q = lastUserMsg.toLowerCase().trim();

  let productsFound = [];
  let cartAction = null;
  let reply = "";

  // Check for greetings
  if (q === "hi" || q === "hello" || q === "hey" || q.startsWith("hi ") || q.startsWith("hello ")) {
    reply = "Welcome to ShopSphere India. I am your dedicated AI Concierge. How may I assist you today with our curated collections, orders, or store policies?";
    return { reply, suggestedProducts: [], cartAction: null };
  }

  // Check for order cancellation intent
  if (q.includes("cancel")) {
    const orderRes = await executeTool("get_user_orders", { limit: 1 }, reqUser);
    if (!orderRes.authenticated) {
      reply = "To request an order cancellation, please sign in to your ShopSphere account or provide your 8-digit Order ID.";
    } else if (orderRes.orderCount === 0) {
      reply = "You do not have any active orders to cancel.";
    } else {
      const o = orderRes.orders[0];
      if (o.status.toLowerCase() === "shipped" || o.status.toLowerCase() === "delivered") {
        reply = `Your recent order #${o.shortId} (₹${Number(o.totalAmount).toLocaleString("en-IN")}) has already been dispatched via Bluedart Express Air and is currently in transit. Because it is already with the courier, it cannot be cancelled immediately. Once it arrives, you can refuse the parcel or initiate a 7-day doorstep return for a full refund.`;
      } else if (o.status.toLowerCase() === "cancelled") {
        reply = `Your order #${o.shortId} is already cancelled.`;
      } else {
        const cancelResult = await executeTool("cancel_order", { orderId: o.orderId.toString() }, reqUser);
        reply = cancelResult.message;
      }
    }
    return { reply, suggestedProducts: [], cartAction: null };
  }

  // Check for off-topic questions in fallback
  const isStoreRelated = q.includes("bag") || q.includes("duffle") || q.includes("backpack") || q.includes("luggage") ||
    q.includes("travel") || q.includes("headphone") || q.includes("audio") || q.includes("product") ||
    q.includes("recommend") || q.includes("show") || q.includes("order") || q.includes("track") ||
    q.includes("where") || q.includes("return") || q.includes("refund") || q.includes("exchange") ||
    q.includes("shipping") || q.includes("delivery") || q.includes("cod") || q.includes("warranty") ||
    q.includes("cart") || q.includes("buy") || q.includes("price") || q.includes("cost") || q.includes("help") ||
    q.includes("who are you") || q.includes("how are you");

  if (!isStoreRelated && q.length > 2) {
    return {
      reply: "I am the dedicated ShopSphere Concierge. I am exclusively tailored to assist you with our luxury product catalog, orders, shipping, and store policies. How may I assist your shopping journey today?",
      suggestedProducts: [],
      cartAction: null
    };
  }

  if (q.includes("bag") || q.includes("duffle") || q.includes("backpack") || q.includes("luggage") || q.includes("travel") || q.includes("headphone") || q.includes("audio") || q.includes("product") || q.includes("recommend") || q.includes("show")) {
    const searchRes = await executeTool("search_products", { query: q, limit: 3 }, reqUser);
    productsFound = searchRes.products || [];
    reply = `Here are curated selections from our catalog tailored to your request:`;
  } else if (q.includes("order") || q.includes("track") || q.includes("where")) {
    const orderRes = await executeTool("get_user_orders", { limit: 3 }, reqUser);
    if (!orderRes.authenticated) {
      reply = "To track your personal shipments and invoice details, please sign in to your ShopSphere account. Alternatively, provide your 8-digit Order ID and I can look it up directly.";
    } else if (orderRes.orderCount === 0) {
      reply = "You currently have no past orders on this account. Explore our curated catalog to begin your journey.";
    } else {
      const o = orderRes.orders[0];
      reply = `Your latest order #${o.shortId} (₹${o.totalAmount.toLocaleString("en-IN")}) is currently ${o.status.toUpperCase()} via Bluedart Express Air.`;
    }
  } else if (q.includes("return") || q.includes("refund") || q.includes("exchange")) {
    const policy = await executeTool("get_store_policy", { topic: "returns" }, reqUser);
    reply = policy.policy;
  } else if (q.includes("shipping") || q.includes("delivery") || q.includes("cod")) {
    const policy = await executeTool("get_store_policy", { topic: "shipping" }, reqUser);
    reply = policy.policy;
  } else {
    reply = "Welcome to ShopSphere India. How may I assist you today with our technical carry bags, precision cabin luggage, acoustic audio gear, or store policies?";
  }

  return {
    reply,
    suggestedProducts: productsFound,
    cartAction
  };
}

// POST /api/ai/chat
exports.chatWithAI = async (req, res) => {
  try {
    const { messages = [] } = req.body;
    const reqUser = req.user || null;

    if (!messages.length) {
      return res.status(400).json({ message: "Messages array is required." });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    // If key not configured, run simulated intelligent catalog concierge
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      const fallbackResult = await handleFallbackChat(messages, reqUser);
      return res.json(fallbackResult);
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const systemInstruction = `You are the exclusive ShopSphere AI Concierge, a formal luxury e-commerce personal shopping assistant and customer support specialist for ShopSphere India.

CRITICAL OPERATIONAL RULES & GUARDRAILS:
1. STRICT STORE DOMAIN ONLY: You ONLY answer questions directly related to ShopSphere, our product catalog (technical bags, backpacks, duffles, cabin luggage, acoustic audio/headphones, studio objects), customer order tracking, delivery status, store policies (7-day returns, warranty, pan-India delivery, Razorpay/COD), and shopping assistance.
2. REFUSAL OF OFF-TOPIC INQUIRIES: If a user asks general knowledge, encyclopedic, academic, coding, math, science, political, historical, or unrelated questions (e.g. "what is cpu", "write a code", "who is elon musk", "solve this math problem"), you MUST politely and formally decline.
Refusal template: "I am the dedicated ShopSphere Concierge. I am exclusively trained to assist you with our luxury products, orders, shipping, and store policies. How may I assist you with your shopping today?"
3. TONE & MANNER: Highly formal, polite, refined, concise, and professional. Never give lengthy technical or academic essays.
4. REAL CATALOG DATA: Use the provided function tools to retrieve real product and order data. Currency is always Indian Rupees (₹ / INR).
5. Customer status: ${reqUser ? `Logged in as ${reqUser.name} (${reqUser.email})` : "Browsing as Guest"}.`;

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction,
      tools: GEMINI_TOOLS
    });

    // Format conversation history for Gemini (must start with user role)
    const chatHistory = [];
    const priorMessages = messages.slice(0, -1);
    const firstUserIdx = priorMessages.findIndex(m => m.role === "user");

    if (firstUserIdx !== -1) {
      for (let i = firstUserIdx; i < priorMessages.length; i++) {
        const m = priorMessages[i];
        const role = m.role === "user" ? "user" : "model";
        if (chatHistory.length === 0 || chatHistory[chatHistory.length - 1].role !== role) {
          chatHistory.push({
            role,
            parts: [{ text: typeof m.content === "string" ? m.content : JSON.stringify(m.content) }]
          });
        }
      }
    }

    const chat = model.startChat({ history: chatHistory });
    const lastUserMessage = messages[messages.length - 1]?.content || "";

    let result = await chat.sendMessage(lastUserMessage);
    let suggestedProducts = [];
    let cartAction = null;

    // Check for Function Calls (Tools)
    const functionCalls = result.response.functionCalls();
    if (functionCalls && functionCalls.length > 0) {
      for (const call of functionCalls) {
        const toolResult = await executeTool(call.name, call.args, reqUser);

        if (call.name === "search_products" && toolResult.products) {
          suggestedProducts = [...suggestedProducts, ...toolResult.products];
        }
        if (call.name === "add_to_cart_action" && toolResult.success) {
          cartAction = toolResult.product;
        }

        // Send function execution response back to Gemini
        const functionResponse = await chat.sendMessage([
          {
            functionResponse: {
              name: call.name,
              response: toolResult
            }
          }
        ]);
        result = functionResponse;
      }
    }

    const reply = result.response.text();

    return res.json({
      reply: reply || "I'm ready to assist you with your ShopSphere journey.",
      suggestedProducts,
      cartAction
    });

  } catch (error) {
    console.warn("Gemini API Controller Note (Running catalog fallback):", error.message || error);
    const fallbackResult = await handleFallbackChat(req.body.messages || [], req.user || null);
    return res.json(fallbackResult);
  }
};
