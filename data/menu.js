// 40 menu items seeded into MongoDB on first start
module.exports = [
  // Starters (6)
  { name: 'Paneer Tikka', category: 'Starters', price: 220, veg: true, emoji: '🧀', description: 'Char-grilled cottage cheese in tandoori spices' },
  { name: 'Chicken 65', category: 'Starters', price: 240, veg: false, emoji: '🍗', description: 'Spicy deep-fried Chennai-style chicken' },
  { name: 'Veg Spring Rolls', category: 'Starters', price: 160, veg: true, emoji: '🥟', description: 'Crispy rolls stuffed with vegetables' },
  { name: 'Gobi Manchurian', category: 'Starters', price: 180, veg: true, emoji: '🥦', description: 'Cauliflower tossed in tangy Manchurian sauce' },
  { name: 'Fish Fingers', category: 'Starters', price: 280, veg: false, emoji: '🐟', description: 'Golden fried fish strips with tartar dip' },
  { name: 'Masala Papad', category: 'Starters', price: 60, veg: true, emoji: '🫓', description: 'Roasted papad topped with onion-tomato masala' },

  // South Indian (6)
  { name: 'Masala Dosa', category: 'South Indian', price: 90, veg: true, emoji: '🥞', description: 'Crispy dosa with potato masala, chutney & sambar' },
  { name: 'Ghee Roast Dosa', category: 'South Indian', price: 120, veg: true, emoji: '🧈', description: 'Paper-thin dosa roasted in pure ghee' },
  { name: 'Idli Vada Combo', category: 'South Indian', price: 70, veg: true, emoji: '🍘', description: '2 idli + 1 vada with sambar & chutneys' },
  { name: 'Onion Uttapam', category: 'South Indian', price: 100, veg: true, emoji: '🧅', description: 'Thick rice pancake topped with onions' },
  { name: 'Ven Pongal', category: 'South Indian', price: 80, veg: true, emoji: '🍚', description: 'Rice & moong dal with pepper and ghee' },
  { name: 'Medu Vada', category: 'South Indian', price: 60, veg: true, emoji: '🍩', description: 'Crispy lentil doughnuts (2 pcs)' },

  // Main Course (6)
  { name: 'Butter Chicken', category: 'Main Course', price: 320, veg: false, emoji: '🍛', description: 'Tandoori chicken in creamy tomato gravy' },
  { name: 'Paneer Butter Masala', category: 'Main Course', price: 260, veg: true, emoji: '🥘', description: 'Paneer cubes in rich buttery gravy' },
  { name: 'Dal Makhani', category: 'Main Course', price: 210, veg: true, emoji: '🫘', description: 'Slow-cooked black lentils with cream' },
  { name: 'Chicken Chettinad', category: 'Main Course', price: 300, veg: false, emoji: '🌶️', description: 'Fiery Chettinad-spiced chicken curry' },
  { name: 'Kadai Veg', category: 'Main Course', price: 230, veg: true, emoji: '🥗', description: 'Mixed vegetables in kadai masala' },
  { name: 'Butter Naan', category: 'Main Course', price: 45, veg: true, emoji: '🫓', description: 'Soft tandoor bread brushed with butter' },

  // Biryani & Rice (5)
  { name: 'Chicken Biryani', category: 'Biryani & Rice', price: 280, veg: false, emoji: '🍗', description: 'Dum-cooked basmati with tender chicken' },
  { name: 'Mutton Biryani', category: 'Biryani & Rice', price: 360, veg: false, emoji: '🍖', description: 'Seeraga samba rice with juicy mutton' },
  { name: 'Veg Biryani', category: 'Biryani & Rice', price: 220, veg: true, emoji: '🍚', description: 'Fragrant rice with garden vegetables' },
  { name: 'Egg Fried Rice', category: 'Biryani & Rice', price: 180, veg: false, emoji: '🍳', description: 'Wok-tossed rice with scrambled egg' },
  { name: 'Jeera Rice', category: 'Biryani & Rice', price: 140, veg: true, emoji: '🌾', description: 'Basmati rice tempered with cumin' },

  // Chinese (5)
  { name: 'Veg Hakka Noodles', category: 'Chinese', price: 170, veg: true, emoji: '🍜', description: 'Stir-fried noodles with crunchy veggies' },
  { name: 'Chicken Schezwan Noodles', category: 'Chinese', price: 200, veg: false, emoji: '🍝', description: 'Spicy Schezwan noodles with chicken' },
  { name: 'Chilli Chicken', category: 'Chinese', price: 250, veg: false, emoji: '🥡', description: 'Crispy chicken with peppers & chilli sauce' },
  { name: 'Veg Fried Rice', category: 'Chinese', price: 160, veg: true, emoji: '🥢', description: 'Classic Indo-Chinese fried rice' },
  { name: 'Manchow Soup', category: 'Chinese', price: 120, veg: true, emoji: '🍲', description: 'Hot & spicy soup with fried noodles' },

  // Pizza & Burgers (6)
  { name: 'Margherita Pizza', category: 'Pizza & Burgers', price: 250, veg: true, emoji: '🍕', description: 'Tomato, mozzarella & fresh basil' },
  { name: 'Farmhouse Pizza', category: 'Pizza & Burgers', price: 320, veg: true, emoji: '🫑', description: 'Capsicum, onion, mushroom & tomato' },
  { name: 'BBQ Chicken Pizza', category: 'Pizza & Burgers', price: 380, veg: false, emoji: '🍕', description: 'Smoky BBQ chicken with onions' },
  { name: 'Classic Veg Burger', category: 'Pizza & Burgers', price: 140, veg: true, emoji: '🍔', description: 'Crispy veg patty with lettuce & mayo' },
  { name: 'Crispy Chicken Burger', category: 'Pizza & Burgers', price: 180, veg: false, emoji: '🍔', description: 'Fried chicken fillet with spicy sauce' },
  { name: 'French Fries', category: 'Pizza & Burgers', price: 110, veg: true, emoji: '🍟', description: 'Salted golden fries' },

  // Desserts (3)
  { name: 'Gulab Jamun', category: 'Desserts', price: 90, veg: true, emoji: '🟤', description: 'Soft khoya dumplings in sugar syrup (2 pcs)' },
  { name: 'Chocolate Brownie', category: 'Desserts', price: 150, veg: true, emoji: '🍫', description: 'Warm fudgy brownie' },
  { name: 'Malai Kulfi', category: 'Desserts', price: 100, veg: true, emoji: '🍦', description: 'Traditional Indian ice cream' },

  // Beverages (3)
  { name: 'Filter Coffee', category: 'Beverages', price: 50, veg: true, emoji: '☕', description: 'Authentic South Indian filter coffee' },
  { name: 'Mango Lassi', category: 'Beverages', price: 110, veg: true, emoji: '🥭', description: 'Chilled yogurt drink with Alphonso mango' },
  { name: 'Fresh Lime Soda', category: 'Beverages', price: 80, veg: true, emoji: '🍋', description: 'Sweet or salted, fizzy & refreshing' },
];
