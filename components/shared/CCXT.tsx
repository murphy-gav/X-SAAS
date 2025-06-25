import React from 'react'
import { CCXTProps } from "@/types";

const CCXT = ({ user, variant } : CCXTProps) => {
  return (
    <div>
      {user === "sign-up" && (
        <div>
          {variant}
        </div>
      )}
    </div>
  )
}

export default CCXT