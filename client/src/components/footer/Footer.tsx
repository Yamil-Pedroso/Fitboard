import React from "react";

const Footer = () => {
  return (
    <div className=" text-black font-bold py-4">
      <div className="container mx-auto text-center">
        <p>
          &copy; {new Date().getFullYear()} Fitness & Nutrition. All rights
          reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
