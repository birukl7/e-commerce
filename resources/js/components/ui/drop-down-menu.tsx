import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";


const categories = [
  {
    id: 1,
    name: "Electronics",
    image: `/images/category-electronics-${Math.floor(Math.random() * 12) + 1}.jpg`,
    productCount: 120,
    subcategories: [
      { id: 11, name: "Laptops", image: `/images/sub-laptops-${Math.floor(Math.random() * 12) + 1}.jpg`, productCount: 35 },
      { id: 12, name: "Smartphones", image: `/images/sub-smartphones-${Math.floor(Math.random() * 12) + 1}.jpg`, productCount: 45 },
      { id: 13, name: "Accessories", image: `/images/sub-accessories-${Math.floor(Math.random() * 12) + 1}.jpg`, productCount: 40 },
    ],
  },
  {
    id: 2,
    name: "Fashion",
    image: `/images/category-fashion-${Math.floor(Math.random() * 12) + 1}.jpg`,
    productCount: 90,
    subcategories: [
      { id: 21, name: "Men", image: `/images/sub-men-${Math.floor(Math.random() * 12) + 1}.jpg`, productCount: 30 },
      { id: 22, name: "Women", image: `/images/sub-women-${Math.floor(Math.random() * 12) + 1}.jpg`, productCount: 40 },
      { id: 23, name: "Accessories", image: `/images/sub-fashion-accessories-${Math.floor(Math.random() * 12) + 1}.jpg`, productCount: 20 },
    ],
  },
  {
    id: 3,
    name: "Home & Kitchen",
    image: `/images/category-home-${Math.floor(Math.random() * 12) + 1}.jpg`,
    productCount: 150,
    subcategories: [
      { id: 31, name: "Furniture", image: `/images/sub-furniture-${Math.floor(Math.random() * 12) + 1}.jpg`, productCount: 50 },
      { id: 32, name: "Appliances", image: `/images/sub-appliances-${Math.floor(Math.random() * 12) + 1}.jpg`, productCount: 60 },
      { id: 33, name: "Decor", image: `/images/sub-decor-${Math.floor(Math.random() * 12) + 1}.jpg`, productCount: 40 },
    ],
  },
  {
    id: 4,
    name: "Sports & Outdoors",
    image: `/images/category-sports-${Math.floor(Math.random() * 12) + 1}.jpg`,
    productCount: 80,
    subcategories: [
      { id: 41, name: "Fitness", image: `/images/sub-fitness-${Math.floor(Math.random() * 12) + 1}.jpg`, productCount: 30 },
      { id: 42, name: "Camping", image: `/images/sub-camping-${Math.floor(Math.random() * 12) + 1}.jpg`, productCount: 25 },
      { id: 43, name: "Cycling", image: `/images/sub-cycling-${Math.floor(Math.random() * 12) + 1}.jpg`, productCount: 25 },
    ],
  },
  {
    id: 5,
    name: "Beauty & Health",
    image: `/images/category-beauty-${Math.floor(Math.random() * 12) + 1}.jpg`,
    productCount: 70,
    subcategories: [
      { id: 51, name: "Skincare", image: `/images/sub-skincare-${Math.floor(Math.random() * 12) + 1}.jpg`, productCount: 30 },
      { id: 52, name: "Makeup", image: `/images/sub-makeup-${Math.floor(Math.random() * 12) + 1}.jpg`, productCount: 20 },
      { id: 53, name: "Supplements", image: `/images/sub-supplements-${Math.floor(Math.random() * 12) + 1}.jpg`, productCount: 20 },
    ],
  },
  {
    id: 6,
    name: "Toys & Games",
    image: `/images/category-toys-${Math.floor(Math.random() * 12) + 1}.jpg`,
    productCount: 60,
    subcategories: [
      { id: 61, name: "Action Figures", image: `/images/sub-actionfigures-${Math.floor(Math.random() * 12) + 1}.jpg`, productCount: 25 },
      { id: 62, name: "Board Games", image: `/images/sub-boardgames-${Math.floor(Math.random() * 12) + 1}.jpg`, productCount: 20 },
      { id: 63, name: "Educational Toys", image: `/images/sub-educational-${Math.floor(Math.random() * 12) + 1}.jpg`, productCount: 15 },
    ],
  },
  {
    id: 7,
    name: "Books",
    image: `/images/category-books-${Math.floor(Math.random() * 12) + 1}.jpg`,
    productCount: 200,
    subcategories: [
      { id: 71, name: "Fiction", image: `/images/sub-fiction-${Math.floor(Math.random() * 12) + 1}.jpg`, productCount: 100 },
      { id: 72, name: "Non-Fiction", image: `/images/sub-nonfiction-${Math.floor(Math.random() * 12) + 1}.jpg`, productCount: 70 },
      { id: 73, name: "Comics", image: `/images/sub-comics-${Math.floor(Math.random() * 12) + 1}.jpg`, productCount: 30 },
    ],
  },
  {
    id: 8,
    name: "Automotive",
    image: `/images/category-automotive-${Math.floor(Math.random() * 12) + 1}.jpg`,
    productCount: 50,
    subcategories: [
      { id: 81, name: "Car Accessories", image: `/images/sub-caraccessories-${Math.floor(Math.random() * 12) + 1}.jpg`, productCount: 20 },
      { id: 82, name: "Motorcycle Parts", image: `/images/sub-motorcycle-${Math.floor(Math.random() * 12) + 1}.jpg`, productCount: 15 },
      { id: 83, name: "Tools & Equipment", image: `/images/sub-tools-${Math.floor(Math.random() * 12) + 1}.jpg`, productCount: 15 },
    ],
  },
  {
    id: 9,
    name: "Groceries",
    image: `/images/category-groceries-${Math.floor(Math.random() * 12) + 1}.jpg`,
    productCount: 130,
    subcategories: [
      { id: 91, name: "Fruits & Vegetables", image: `/images/sub-fruits-${Math.floor(Math.random() * 12) + 1}.jpg`, productCount: 50 },
      { id: 92, name: "Beverages", image: `/images/sub-beverages-${Math.floor(Math.random() * 12) + 1}.jpg`, productCount: 40 },
      { id: 93, name: "Snacks", image: `/images/sub-snacks-${Math.floor(Math.random() * 12) + 1}.jpg`, productCount: 40 },
    ],
  },
  {
    id: 10,
    name: "Pet Supplies",
    image: `/images/category-pets-${Math.floor(Math.random() * 12) + 1}.jpg`,
    productCount: 85,
    subcategories: [
      { id: 101, name: "Food", image: `/images/sub-petfood-${Math.floor(Math.random() * 12) + 1}.jpg`, productCount: 35 },
      { id: 102, name: "Toys", image: `/images/sub-pettoys-${Math.floor(Math.random() * 12) + 1}.jpg`, productCount: 25 },
      { id: 103, name: "Grooming", image: `/images/sub-grooming-${Math.floor(Math.random() * 12) + 1}.jpg`, productCount: 25 },
    ],
  },
];



export function CategoryDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-black cursor-pointer">
          <Menu className="mr-2" />
          Categories
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="start">
        <DropdownMenuLabel>Select Category</DropdownMenuLabel>
        <DropdownMenuGroup>
          {categories.map((category) => (
            <DropdownMenuSub key={category.id}>
              <DropdownMenuSubTrigger className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100">
                  <img
                    src={`image/image-${Math.floor(Math.random() * 12) + 1}.jpg`}

                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-medium">{category.name}</span>
                  <span className="text-xs text-gray-500">{category.productCount} products</span>
                </div>
              </DropdownMenuSubTrigger>

              <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-60">
                  {category.subcategories.map((sub, i) => (
                    <DropdownMenuItem key={sub.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-md overflow-hidden bg-gray-100">
                        <img
                          src={`image/image-${i+1}.jpg`}
                          alt={sub.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-medium">{sub.name}</span>
                        <span className="text-xs text-gray-500">{sub.productCount} products</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
