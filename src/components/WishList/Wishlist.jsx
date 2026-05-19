import React, { useState } from 'react'
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai'
import axiosConfig from "../../Services/axiosConfig"
import LoginModal from '../Login/Login'
import { toast } from 'react-toastify';

function Wishlist({ productData, selectedOption, wishListed, onLoad }) {
  const [loginShow, setLoginShow] = useState(false);

  const isLogin = localStorage.getItem("token")
  const userId = localStorage.getItem("userid")
  const handleLoginShow = () => setLoginShow(true)
  async function addToWishlist() {
    if (!isLogin) return handleLoginShow()
    const payload = {
      user: userId,
      varient: productData?.id,
      type: selectedOption === "buy" ? "sale" : "rental"
    }
    try {
      const response = await axiosConfig.post(`/catlog/wishlists/`, payload)
      onLoad && onLoad();
      toast.success("product added to wishlist")
    } catch (error) {
      console.log(error)
    }
  }
  async function removeFromWishList() {
    try {
      await axiosConfig.delete(`/catlog/wishlists/${wishListed?.id}/`)
      toast.success("product removed from wishlist")
      onLoad && onLoad();
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div>
      {
        wishListed?.in_wishlist ? <AiFillHeart className='wishlisted-icon' size={18} onClick={removeFromWishList} /> :
          <AiOutlineHeart className='wishlisted-icon' size={18} onClick={addToWishlist} />
      }
      <LoginModal show={loginShow} onHide={() => setLoginShow(false)} />
    </div>
  )
}

export default React.memo(Wishlist)