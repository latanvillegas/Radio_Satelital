"use client"
import React from 'react'
import { motion } from 'framer-motion'

export default function SkeletonCard(){
  return (
    <motion.div className="station-card skeleton" initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1.2 }}> 
      <div className="st-info">
        <div className="st-icon skeleton-box" />
        <div>
          <div className="skeleton-line" style={{width:'140px'}} />
          <div className="skeleton-line" style={{width:'90px',marginTop:8}} />
        </div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <div className="skeleton-circle" />
        <div className="skeleton-circle" />
      </div>
    </motion.div>
  )
}
