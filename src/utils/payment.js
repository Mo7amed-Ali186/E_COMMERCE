import Stripe from "stripe";

async function payment({
    stripe = new Stripe(process.env.STRIPE_KEY),
    payment_method_types = ["card"], // Use lowercase "card" instead of "Card"
    mode = "payment",
    success_url = process.env.SUCCESS_URL,
    cancel_url = process.env.CANCEL_URL,
    discounts = [],
    customer_email = "",
    line_items = [],
    metadata={}
} = {}) {
    const session = await stripe.checkout.sessions.create({
        payment_method_types,
        mode,
        success_url,
        cancel_url,
        discounts,
        customer_email,
        line_items,
        metadata,
    });
    return session;
}

export default payment;


// {
//     price_data: {
//         currency: "USD",
//         product_data: {
//             name,
//         },
//         unit_amount: "",
//     },
//     quantity: 1,
// },
