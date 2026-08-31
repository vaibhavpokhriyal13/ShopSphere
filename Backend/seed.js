const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");

const User = require("./model/User");
const Product = require("./model/Product");
const Order = require("./model/order");

dotenv.config();

const users = [
    {
        name: "Admin User",
        email: "admin@shopsphere.com",
        password: "password123",
        role: "admin",
        isVerified: true
    },
    {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "user",
        isVerified: true
    },
    {
        name: "Jane Smith",
        email: "jane@example.com",
        password: "password123",
        role: "user",
        isVerified: true
    },
    {
        name: "Vaibhav Sharma",
        email: "vaibhav@example.com",
        password: "password123",
        role: "user",
        isVerified: true
    }
];

const products = [
    {
        name: "The Weekender Duffle Bag",
        price: 4999,
        description: "Handcrafted from water-resistant heavy canvas and premium vegetable-tanned leather. Features an integrated shoe compartment, antique brass hardware, and detachable shoulder harness. Ideal for quick weekend getaways across India.",
        imageURL: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
        category: "Accessories",
        brand: "ShopSphere Carry",
        countInStock: 25,
        rating: 4.9,
        numReviews: 28
    },
    {
        name: "Carry-On Pro Hard Shell Trolley",
        price: 8999,
        description: "Sleek matte black aerospace-grade polycarbonate hard-shell cabin trolley with 360° whisper-quiet Japanese Hinomoto wheels, integrated TSA lock, and internal compression organizers.",
        imageURL: "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&w=800&q=80",
        category: "Travel",
        brand: "Sphere Luggage",
        countInStock: 18,
        rating: 4.8,
        numReviews: 19
    },
    {
        name: "Nomad Tech Commuter Backpack",
        price: 3499,
        description: "Minimalist daily commuter backpack with clean aerodynamic lines, weather-sealed zippers, padded 16-inch laptop chamber, and breathable ergonomic back airflow panel.",
        imageURL: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80",
        category: "Accessories",
        brand: "Sphere Urban",
        countInStock: 42,
        rating: 4.9,
        numReviews: 35
    },
    {
        name: "Aura ANC Wireless Studio Headphones",
        price: 7499,
        description: "Precision-tuned studio acoustics with hybrid active noise cancellation, transparency ambient mode, and 45-hour extended battery life with fast Type-C charging.",
        imageURL: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        category: "Electronics",
        brand: "Aura Acoustics",
        countInStock: 30,
        rating: 4.9,
        numReviews: 44
    },
    {
        name: "Titanium Armor Smartphone Case",
        price: 1299,
        description: "Durable and stylish smartphone protective case crafted with precision from matte shock-absorbent TPU and aircraft-grade aluminum alloy corners.",
        imageURL: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80",
        category: "Electronics",
        brand: "ArmorShield",
        countInStock: 120,
        rating: 4.8,
        numReviews: 52
    },
    {
        name: "Chrono Minimalist Steel Watch",
        price: 5499,
        description: "Ultra-slim surgical stainless steel casing with scratch-resistant sapphire crystal glass and Japanese quartz movement. 5 ATM water resistant.",
        imageURL: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
        category: "Fashion",
        brand: "Chrono Precision",
        countInStock: 20,
        rating: 4.8,
        numReviews: 21
    },
    {
        name: "Nike Air Max 270 React Running Shoes",
        price: 9999,
        description: "The Nike Air Max 270 delivers unmatched all-day comfort with bold street style and an ultra-soft dual-density foam midsole with Nike React technology.",
        imageURL: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
        category: "Fashion",
        brand: "Nike",
        countInStock: 35,
        rating: 4.9,
        numReviews: 38
    },
    {
        name: "Ceramic Aroma Mist Diffuser",
        price: 2199,
        description: "Handcrafted matte textured porcelain with whisper-quiet ultrasonic atomization and warm ambient underglow. Suitable for essential oils and relaxation.",
        imageURL: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80",
        category: "Home & Kitchen",
        brand: "Sphere Living",
        countInStock: 50,
        rating: 4.7,
        numReviews: 16
    },
    {
        name: "Apple iPhone 15 Pro Max (256 GB)",
        price: 134900,
        description: "Forged in titanium and featuring the groundbreaking A17 Pro chip, customizable Action button, 48MP Pro camera system, and USB-C with USB 3 speeds.",
        imageURL: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
        category: "Electronics",
        brand: "Apple",
        countInStock: 15,
        rating: 4.9,
        numReviews: 60
    },
    {
        name: "Minimalist Leather Cardholder Wallet",
        price: 1499,
        description: "Slim profile RFID-blocking leather cardholder featuring 6 card slots and a central currency sleeve. Pocket-friendly luxury everyday carry.",
        imageURL: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
        category: "Accessories",
        brand: "Sphere Leather",
        countInStock: 80,
        rating: 4.8,
        numReviews: 29
    },
    {
        name: "MacBook Pro 14-inch (M3 Pro)",
        price: 189900,
        description: "The 14-inch MacBook Pro with M3 Pro delivers jaw-dropping performance for demanding creative workflows, with Liquid Retina XDR display and 18-hour battery.",
        imageURL: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
        category: "Electronics",
        brand: "Apple",
        countInStock: 8,
        rating: 5.0,
        numReviews: 24
    },
    {
        name: "Ergonomic Mesh Task Desk Chair",
        price: 13999,
        description: "Engineered for 8+ hour work sessions with breathable Korean mesh, dynamic self-adjusting lumbar support, tilt-lock recline, and smooth multi-surface wheels.",
        imageURL: "https://images.unsplash.com/photo-1580481077197-0f8188e7d23d?auto=format&fit=crop&w=800&q=80",
        category: "Home & Kitchen",
        brand: "ErgoComfort",
        countInStock: 14,
        rating: 4.6,
        numReviews: 17
    },
    {
        name: "Enameled Cast Iron Dutch Oven (5.5L)",
        price: 4999,
        description: "Heavyweight enameled cast iron delivers superior heat distribution and locking steam lid, ideal for artisan sourdough baking, slow braises, and stews.",
        imageURL: "https://images.unsplash.com/photo-1584990347449-39958eb75eb7?auto=format&fit=crop&w=800&q=80",
        category: "Home & Kitchen",
        brand: "Artisan Kitchen",
        countInStock: 22,
        rating: 4.9,
        numReviews: 31
    },
    {
        name: "Classic Denim Selvedge Slim Jeans",
        price: 2999,
        description: "Authentic Japanese selvedge raw indigo denim woven on vintage shuttle looms. Tailored slim fit that develops custom natural fades with every wear.",
        imageURL: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
        category: "Fashion",
        brand: "DenimCraft",
        countInStock: 45,
        rating: 4.7,
        numReviews: 18
    },
    {
        name: "Adjustable Rubber Hex Dumbbell Set",
        price: 6999,
        description: "Anti-roll hexagonal rubber-coated dumbbells with diamond knurled chrome grip handles designed for high-intensity home training and longevity.",
        imageURL: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80",
        category: "Fitness",
        brand: "IronGrip",
        countInStock: 19,
        rating: 4.9,
        numReviews: 27
    },
    {
        name: "Smart Hydration Thermal Flask (750ml)",
        price: 1799,
        description: "Double-walled vacuum insulated 18/8 food-grade stainless steel bottle with LED touch temperature display lid. Keeps beverages cold 24h or hot 12h.",
        imageURL: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
        category: "Accessories",
        brand: "HydroPure",
        countInStock: 65,
        rating: 4.8,
        numReviews: 33
    },
    {
        name: "Retro Mechanical Gaming Keyboard",
        price: 4999,
        description: "75% compact mechanical keyboard with hot-swappable lubricated linear switches, dye-sub PBT keycaps, gasket mount structure, and Bluetooth 5.1 / 2.4G wireless.",
        imageURL: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
        category: "Electronics",
        brand: "KeyVibe",
        countInStock: 28,
        rating: 4.9,
        numReviews: 41
    },
    {
        name: "Barista Espresso & Cappuccino Machine",
        price: 16999,
        description: "Authentic cafe-style espresso maker featuring a 15-bar Italian pressure pump, precision PID temperature control, and commercial stainless steam wand for micro-foam latte art.",
        imageURL: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80",
        category: "Home & Kitchen",
        brand: "CaffèPro",
        countInStock: 11,
        rating: 4.8,
        numReviews: 25
    }
];


const importData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Order.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();

        console.log("Old data cleared...");

        // Hash passwords and create users
        const createdUsers = [];
        for (const user of users) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);
            const newUser = await User.create({
                ...user,
                password: hashedPassword
            });
            createdUsers.push(newUser);
        }

        const adminUser = createdUsers.find((u) => u.role === "admin");
        const regularUsers = createdUsers.filter((u) => u.role === "user");

        console.log(`Created ${createdUsers.length} users...`);

        // Attach admin as creator for products and add sample reviews
        const sampleProducts = products.map((product) => {
            const reviewer = regularUsers[Math.floor(Math.random() * regularUsers.length)];
            return {
                ...product,
                user: adminUser._id,
                reviews: [
                    {
                        user: reviewer._id,
                        name: reviewer.name,
                        rating: 5,
                        comment: "Excellent product, high quality and fast shipping!"
                    }
                ]
            };
        });

        const createdProducts = await Product.insertMany(sampleProducts);
        console.log(`Created ${createdProducts.length} products...`);

        // Create sample orders for analytics and testing
        const sampleOrders = [
            {
                user: regularUsers[0]._id,
                items: [
                    { product: createdProducts[0]._id, quantity: 1 },
                    { product: createdProducts[1]._id, quantity: 1 }
                ],
                totalAmount: createdProducts[0].price + createdProducts[1].price,
                status: "delivered",
                address: "42 MG Road",
                city: "Bengaluru",
                state: "Karnataka",
                pin: "560001",
                country: "India",
                phone: "9876543210",
                paymentMethod: "UPI",
                paidAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                shippingDetails: {
                    name: regularUsers[0].name,
                    phone: "9876543210",
                    email: regularUsers[0].email,
                    address: "42 MG Road",
                    city: "Bengaluru",
                    state: "Karnataka",
                    pin: "560001",
                    country: "India"
                },
                paymentId: "pay_sample_101",
                paymentStatus: "paid",
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            },
            {
                user: regularUsers[1]._id,
                items: [
                    { product: createdProducts[3]._id, quantity: 2 },
                    { product: createdProducts[4]._id, quantity: 1 }
                ],
                totalAmount: createdProducts[3].price * 2 + createdProducts[4].price,
                status: "shipped",
                address: "15 Marine Drive",
                city: "Mumbai",
                state: "Maharashtra",
                pin: "400020",
                country: "India",
                phone: "9123456789",
                paymentMethod: "UPI",
                paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                shippingDetails: {
                    name: regularUsers[1].name,
                    phone: "9123456789",
                    email: regularUsers[1].email,
                    address: "15 Marine Drive",
                    city: "Mumbai",
                    state: "Maharashtra",
                    pin: "400020",
                    country: "India"
                },
                paymentId: "pay_sample_102",
                paymentStatus: "paid",
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            },
            {
                user: regularUsers[2]._id,
                items: [
                    { product: createdProducts[9]._id, quantity: 1 },
                    { product: createdProducts[10]._id, quantity: 2 }
                ],
                totalAmount: createdProducts[9].price + createdProducts[10].price * 2,
                status: "pending",
                address: "88 Park Street",
                city: "Kolkata",
                state: "West Bengal",
                pin: "700016",
                country: "India",
                phone: "9988776655",
                paymentMethod: "COD",
                shippingDetails: {
                    name: regularUsers[2].name,
                    phone: "9988776655",
                    email: regularUsers[2].email,
                    address: "88 Park Street",
                    city: "Kolkata",
                    state: "West Bengal",
                    pin: "700016",
                    country: "India"
                },
                paymentId: "pay_sample_103",
                paymentStatus: "pending",
                createdAt: new Date()
            }
        ];

        await Order.insertMany(sampleOrders);
        console.log(`Created ${sampleOrders.length} sample orders...`);

        console.log("\n==========================================");
        console.log("Data Seeded Successfully!");
        console.log("Admin Credentials: admin@shopsphere.com | password123");
        console.log("User Credentials:  john@example.com   | password123");
        console.log("==========================================\n");

        process.exit(0);
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await connectDB();

        await Order.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();

        console.log("Data Destroyed Successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error destroying data:", error);
        process.exit(1);
    }
};

if (process.argv[2] === "-d") {
    destroyData();
} else {
    importData();
}
