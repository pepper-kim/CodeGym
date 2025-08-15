// =====================================
// 📦 E-Commerce Product Processing System (Complete Code + Tests)
// =====================================

// ✅ [모듈 스코프] 완전한 캡슐화를 위한 심볼과 WeakMap 사용
const INTERNAL_ID = Symbol("internalId"); // 상품 고유 ID (외부 노출 금지)
const stockData = new WeakMap(); // 상품 재고 정보 (외부 직접 접근 금지)

// =====================================
// 👤 [추상 클래스] User (Customer, Admin 공통 기능)
// =====================================
class User {
  #password; // 비밀번호 은닉 (Private Field)

  constructor(name, password) {
    if (new.target === User) {
      throw new Error(
        "User는 추상 클래스입니다. 직접 인스턴스화할 수 없습니다."
      );
    }
    this.name = name;
    this.#password = password;
    this.isSuspended = false; // 계정 정지 여부
  }

  // ✅ 로그인 메서드: 비밀번호 검증 및 계정 정지 여부 체크
  login(inputPw) {
    if (this.isSuspended) {
      console.log(`🚫 ${this.name} 계정은 정지되었습니다. 로그인 실패.`);
      return false;
    }
    if (inputPw === this.#password) {
      console.log(`✅ ${this.name}님, 로그인 성공!`);
      return true;
    }
    console.log(`❌ ${this.name}님, 비밀번호가 틀렸습니다.`);
    return false;
  }
}

// =====================================
// 🛒 Customer (일반 사용자)
// =====================================
class Customer extends User {
  constructor(name, password) {
    super(name, password);
    this.cart = []; // 장바구니 (상품 목록)
    this.notifications = { email: true, sms: true, push: true }; // 알림 설정
  }

  // ✅ 장바구니에 상품 추가
  addToCart(product) {
    if (!product.isVisible || (stockData.get(product) ?? 0) <= 0) {
      console.log(`📛 "${product.name}" 상품은 구매할 수 없습니다.`);
      return;
    }
    this.cart.push(product);
    console.log(`🛒 "${product.name}" 장바구니에 추가되었습니다.`);
  }

  // ✅ 장바구니 상품으로 주문 생성
  createOrder() {
    if (this.cart.length === 0) {
      console.log(`🛍️ 장바구니가 비어있습니다. 주문할 수 없습니다.`);
      return null;
    }
    const order = new Order(this, this.cart);
    this.cart = []; // 장바구니 비우기
    return order;
  }

  // ✅ 상품 리뷰 작성
  reviewProduct(product, rating, comment) {
    product.addReview(this, rating, comment);
    console.log(
      `✍️ ${this.name}님이 "${product.name}"에 리뷰를 남겼습니다. 평점: ${rating} / 내용: "${comment}"`
    );
  }

  // ✅ 알림 설정 변경
  updateNotificationPreference(type, value) {
    if (this.notifications.hasOwnProperty(type)) {
      this.notifications[type] = value;
      console.log(`🔔 ${this.name}님의 ${type} 알림 설정: ${value}`);
    } else {
      console.log(`⚠️ 알림 유형 "${type}"은 잘못되었습니다.`);
    }
  }
}

// =====================================
// 🛠️ Admin (관리자)
// =====================================
class Admin extends User {
  constructor(name, password) {
    super(name, password);
  }

  // ✅ 상품 추가
  addProduct(product, stock) {
    stockData.set(product, stock);
    Product.catalog.push(product);
    console.log(
      `📦 관리자 ${this.name}님이 "${product.name}"을(를) 추가했습니다. 재고: ${stock}`
    );
  }

  // ✅ 재고 변경
  changeStock(product, newStock) {
    if (!stockData.has(product)) {
      console.log(`🚫 "${product.name}" 상품은 관리 대상이 아닙니다.`);
      return;
    }
    stockData.set(product, newStock);
    console.log(`📈 "${product.name}" 재고가 ${newStock}개로 변경되었습니다.`);
  }

  // ✅ 재고 확인
  checkStock(product) {
    return stockData.get(product) ?? 0;
  }

  // ✅ 상품 노출 상태 토글
  toggleProductVisibility(product) {
    product.isVisible = !product.isVisible;
    console.log(`👀 "${product.name}" 표시 여부: ${product.isVisible}`);
  }

  // ✅ 상품 삭제
  deleteProduct(product) {
    Product.catalog = Product.catalog.filter((p) => p !== product);
    stockData.delete(product);
    console.log(`🗑️ "${product.name}" 상품이 카탈로그에서 삭제되었습니다.`);
  }

  // ✅ 사용자 계정 정지
  suspendCustomer(user) {
    if (user instanceof User) {
      user.isSuspended = true;
      console.log(`⛔ 사용자 ${user.name} 계정이 정지되었습니다.`);
    }
  }

  // ✅ 사용자 계정 복구
  reinstateCustomer(user) {
    if (user instanceof User) {
      user.isSuspended = false;
      console.log(`✅ 사용자 ${user.name} 계정이 복구되었습니다.`);
    }
  }
}

// =====================================
// 📦 [추상 클래스] Product
// =====================================
class Product {
  static catalog = [];
  static nextId = 1;

  constructor(name, price) {
    if (new.target === Product) {
      throw new Error("Product는 추상 클래스입니다.");
    }
    this.name = name;
    this.price = price;
    this[INTERNAL_ID] = Product.nextId++;
    this.isVisible = true;
    this.reviews = [];
  }

  // ✅ 상품 배송 (추상 메서드, 서브 클래스에서 구현 필요)
  deliver(toUser) {
    throw new Error("서브 클래스에서 deliver()를 반드시 구현해야 합니다.");
  }

  // ✅ 카탈로그 출력
  static printCatalog() {
    console.log(`\n📚 [현재 상품 카탈로그]`);
    for (const p of Product.catalog) {
      const stock = stockData.get(p) ?? 0;
      const visibility = p.isVisible ? "" : "(숨김 처리됨) ";
      console.log(
        `- ${p.name} | 💰 ${p.price}원 | 📦 재고: ${stock} | ${visibility}`
      );
    }
  }

  // ✅ 리뷰 추가
  addReview(customer, rating, comment) {
    this.reviews.push({ user: customer.name, rating, comment });
  }

  // ✅ 평균 평점 계산
  getAverageRating() {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / this.reviews.length;
  }
}

// =====================================
// 📦 PhysicalProduct (실물 상품)
// =====================================
class PhysicalProduct extends Product {
  constructor(name, price, weight) {
    super(name, price);
    this.weight = weight;
  }

  // ✅ 실물 상품 배송
  deliver(toUser) {
    console.log(
      `📦 "${this.name}" 상품이 ${toUser.name}님께 택배로 배송됩니다. (무게: ${this.weight}kg)`
    );
  }
}

// =====================================
// 📧 DigitalProduct (디지털 상품)
// =====================================
class DigitalProduct extends Product {
  constructor(name, price, fileSize) {
    super(name, price);
    this.fileSize = fileSize;
  }

  // ✅ 디지털 상품 전송
  deliver(toUser) {
    console.log(
      `📧 "${this.name}" 다운로드 링크가 ${toUser.name}님께 이메일로 발송되었습니다. (파일 크기: ${this.fileSize}MB)`
    );
  }
}

// =====================================
// 📄 Order (주문)
// =====================================
class Order {
  static nextOrderId = 1;

  constructor(customer, products) {
    this.id = Order.nextOrderId++;
    this.customer = customer;
    this.products = [...products];
    this.totalPrice = products.reduce((sum, p) => sum + p.price, 0);
    this.status = "pending";
  }

  // ✅ 주문 결제 및 상품 배송
  checkout(paymentMethod) {
    if (this.status !== "pending") {
      console.log(
        `🚫 주문 ${this.id}은 처리할 수 없습니다. 현재 상태: ${this.status}`
      );
      return;
    }
    paymentMethod.processPayment(this.totalPrice);
    for (const p of this.products) {
      p.deliver(this.customer);
      if (stockData.has(p)) {
        const currentStock = stockData.get(p);
        stockData.set(p, currentStock - 1);
      }
    }
    this.status = "completed";
    console.log(
      `✅ 주문 ${this.id}이 완료되었습니다. 총 결제 금액: 💰 ${this.totalPrice}원`
    );
  }

  // ✅ 주문 취소
  cancel() {
    if (this.status !== "pending") {
      console.log(
        `🚫 주문 ${this.id}은 취소할 수 없습니다. 현재 상태: ${this.status}`
      );
      return;
    }
    this.status = "cancelled";
    console.log(`❌ 주문 ${this.id}이 취소되었습니다.`);
  }
}

// =====================================
// 💳 [추상 클래스] PaymentMethod (결제 수단 인터페이스)
// =====================================
class PaymentMethod {
  processPayment(amount) {
    throw new Error("processPayment()는 반드시 구현해야 합니다.");
  }
}

// =====================================
// 💳 CreditCardPayment (신용카드 결제)
// =====================================
class CreditCardPayment extends PaymentMethod {
  processPayment(amount) {
    console.log(`💳 신용카드로 ${amount}원 결제가 처리되었습니다.`);
  }
}

// =====================================
// 💰 PayPalPayment (PayPal 결제)
// =====================================
class PayPalPayment extends PaymentMethod {
  processPayment(amount) {
    console.log(`💰 PayPal로 ${amount}원 결제가 처리되었습니다.`);
  }
}

// =====================================
// ✅ 테스트 시나리오
// =====================================

// 1) 관리자 Alice가 상품 추가
const adminAlice = new Admin("Alice", "admin123");
const laptop = new PhysicalProduct("Laptop", 1500, 2.5);
const ebook = new DigitalProduct("E-Book", 30, 150);
adminAlice.addProduct(laptop, 5);
adminAlice.addProduct(ebook, 100);
Product.printCatalog();

// 2) 고객 Bob이 로그인 및 장바구니에 담기
const customerBob = new Customer("Bob", "pass1234");
customerBob.login("pass1234");
customerBob.addToCart(laptop);
customerBob.addToCart(ebook);

// 3) 주문 생성 및 결제 (신용카드)
const order1 = customerBob.createOrder();
if (order1) order1.checkout(new CreditCardPayment());
Product.printCatalog();

// 4) 관리자 재고 확인 및 보충
console.log(
  `Remaining stock of Laptop: ${adminAlice.checkStock(laptop)} units`
);
adminAlice.changeStock(laptop, 10);
adminAlice.changeStock(ebook, 120);
Product.printCatalog();

// 5) 주문 취소 테스트
if (order1) order1.cancel(); // 실패: 이미 완료됨
customerBob.addToCart(laptop);
const order2 = customerBob.createOrder();
if (order2) order2.cancel(); // 성공: pending 상태

// 6) 리뷰 작성 및 평점 확인
customerBob.reviewProduct(laptop, 5, "Excellent quality!");
console.log(
  `Average rating of ${laptop.name}: ${laptop
    .getAverageRating()
    .toFixed(1)} stars`
);

// 7) 상품 숨김 및 삭제
adminAlice.toggleProductVisibility(ebook);
Product.printCatalog();
adminAlice.deleteProduct(ebook);
Product.printCatalog();

// 8) 계정 정지/복구 테스트
adminAlice.suspendCustomer(customerBob);
customerBob.login("pass1234"); // 실패
adminAlice.reinstateCustomer(customerBob);
customerBob.login("pass1234"); // 성공

// 9) PayPal 결제 테스트
customerBob.addToCart(laptop);
const order3 = customerBob.createOrder();
if (order3) order3.checkout(new PayPalPayment());
Product.printCatalog();
