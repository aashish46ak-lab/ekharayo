
INSERT INTO public.categories (name, slug, description, sort_order) VALUES
 ('Dairy Products','dairy','Milk, curd, ghee and more',1),
 ('Goat Products','goat','Fresh farm-raised goat meat',2),
 ('Chicken Products','chicken','Chicken and farm eggs',3),
 ('Crop Products','crops','Rice, wheat and vegetables',4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, description, category_id, price, stock, unit, featured)
SELECT v.name, v.slug, v.descr, c.id, v.price, 50, v.unit, v.feat
FROM (VALUES
 ('Fresh Cow Milk','fresh-cow-milk','Pure farm-fresh cow milk, delivered daily.','dairy',110::numeric,'litre',true),
 ('Homemade Curd (Dahi)','homemade-curd','Thick, creamy curd made the traditional way.','dairy',160::numeric,'kg',false),
 ('Pure Ghee','pure-ghee','Organic clarified butter for rich flavor.','dairy',1800::numeric,'kg',true),
 ('Fresh Goat Meat (Khasi ko Masu)','goat-meat','Tender, farm-raised goat meat.','goat',1400::numeric,'kg',true),
 ('Farm Chicken (Kukhura)','farm-chicken','Free-range, antibiotic-free chicken.','chicken',420::numeric,'kg',false),
 ('Farm Eggs (Anda)','farm-eggs','Fresh organic eggs from happy hens.','chicken',20::numeric,'piece',true),
 ('Organic Rice (Chamal)','organic-rice','Premium local rice varieties.','crops',120::numeric,'kg',false),
 ('Wheat (Gahu)','wheat','Freshly harvested whole wheat.','crops',80::numeric,'kg',false),
 ('Seasonal Vegetables','seasonal-vegetables','Daily-picked fresh vegetables.','crops',60::numeric,'kg',false)
) AS v(name, slug, descr, cat, price, unit, feat)
JOIN public.categories c ON c.slug = v.cat
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.site_settings (key, value) VALUES
 ('hero', '{"badge":"Nepal''s Agricultural Marketplace","title":"Quality Agriculture,","highlight":"One Trusted Platform","subtitle":"eKharayo is the official digital marketplace of Great Sagarmatha Traders PVT LTD — our own farm products plus carefully selected goods from trusted Nepali and international suppliers."}'::jsonb),
 ('banners', '{"images":[]}'::jsonb),
 ('contact', '{"phone1":"9852049458","phone2":"9802749458","email":"ghagro2080@gmail.com","address":"Patharishanishchare-5, Morang, Nepal"}'::jsonb),
 ('about', '{"body":"eKharayo is the official digital marketplace of Great Sagarmatha Traders PVT LTD, based in Patharishanishchare-5, Morang, Nepal. We operate our own farms and mills and partner with trusted Nepali and international suppliers."}'::jsonb),
 ('faq', '{"items":[{"q":"How fast is delivery?","a":"Orders inside Morang are delivered within 24 hours."},{"q":"How do I pay?","a":"Cash on delivery is available for all orders."}]}'::jsonb),
 ('privacy', '{"body":"We collect only the information needed to process and deliver your orders."}'::jsonb),
 ('terms', '{"body":"By ordering from eKharayo you agree to our standard terms of sale."}'::jsonb),
 ('shipping', '{"body":"We deliver across Morang and nearby districts. Delivery charges may apply outside the valley."}'::jsonb),
 ('returns', '{"body":"Perishable goods can be returned on delivery if quality is unsatisfactory."}'::jsonb),
 ('footer', '{"text":"The official digital marketplace of Great Sagarmatha Traders PVT LTD — quality agricultural products from Nepal and trusted international suppliers."}'::jsonb),
 ('branding', '{"logo_url":"","favicon_url":""}'::jsonb),
 ('social', '{"facebook":"","instagram":"","tiktok":"","youtube":""}'::jsonb),
 ('store', '{"delivery_fee":0,"currency":"Rs."}'::jsonb)
ON CONFLICT (key) DO NOTHING;
