package com.tuapp.kmlcraft

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // ESTA LÍNEA ES LA QUE CONECTA CON EL DISEÑO:
        setContentView(R.layout.activity_main)
    }
}
