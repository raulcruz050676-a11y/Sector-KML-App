package com.tuapp.kmlcraft

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
// ESTA LÍNEA ES EL PUENTE QUE FALTA:
import com.tuapp.kmlcraft.R

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Usamos la referencia completa para que no haya dudas:
        setContentView(R.layout.activity_main)
    }
}
