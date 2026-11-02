export interface CartLine {
  id: string;
  name: string;
  size: string;
  price: number;
}

export const freshmartCart: CartLine[] = [
{ id: 'l1', name: 'Whole Milk', size: '1 gal', price: 4.29 },
{ id: 'l2', name: 'Large Eggs', size: '12 ct', price: 3.99 },
{ id: 'l3', name: 'Whole Wheat Bread', size: '1 loaf', price: 3.49 },
{ id: 'l4', name: 'Chicken Breast', size: '2 lb', price: 9.98 },
{ id: 'l5', name: 'Jasmine Rice', size: '5 lb', price: 7.49 },
{ id: 'l6', name: 'Broccoli Crowns', size: '1 lb', price: 2.49 },
{ id: 'l7', name: 'Carrots', size: '2 lb', price: 1.99 },
{ id: 'l8', name: 'Baby Spinach', size: '5 oz', price: 3.49 },
{ id: 'l9', name: 'Bananas', size: '~2 lb', price: 1.29 },
{ id: 'l10', name: 'Greek Yogurt', size: '32 oz', price: 4.5 }];


export const freshmartCartTotal = 43.0;
export const approvalFingerprint = '9f2c41e1';
export const approvalExpirySeconds = 29 * 60 + 12;
export const quickcartTotal = 18.0;