import React, { useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import { MdRestaurantMenu } from "react-icons/md";
import MenuContainer from "../components/menu/MenuContainer";
import CustomerInfo from "../components/menu/CustomerInfo";
import CartInfo from "../components/menu/CartInfo";
import Bill from "../components/menu/Bill";
import { useSelector } from "react-redux";

const Menu = () => {
  useEffect(() => {
    document.title = "POS | Menu";
  }, []);

  const customerData = useSelector((state) => state.customer);

  return (
    <section className="bg-[#1f1f1f] min-h-screen overflow-auto">
      <div className="flex flex-col xl:flex-row gap-3 xl:gap-3 min-h-screen">
        {/* Left Div - Menu Content */}
        <div className="flex-1 xl:flex-[3]">
          <div className="overflow-auto max-h-[calc(100vh-220px)] sm:max-h-[calc(100vh-200px)] lg:max-h-[calc(100vh-150px)]">
            <MenuContainer />
          </div>
        </div>

        {/* Right Div - Cart/Sidebar */}
        <div className="w-full xl:w-auto xl:flex-[1] bg-[#1a1a1a] mx-3 xl:mt-4 xl:mr-3 rounded-lg pt-2 mb-20 xl:mb-0 xl:h-[calc(100vh-120px)] overflow-auto">
          <div className="flex-1 overflow-auto">
            <CartInfo />
          </div>
          <hr className="border-[#2a2a2a] border-t-2" />
          {/* Bills */}
          <Bill />
        </div>
      </div>

      <BottomNav />
    </section>
  );
};

export default Menu;
