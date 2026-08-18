"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Playfair_Display, Inter } from "next/font/google";

const playfair= Playfair_Display({ subsets: ["latin"], weight: ["600", "700", "800"] });
const inter = Inter({ subsets: ["latin"]});

export default function LoginAdmin() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            //buat nembak endpoint - Fikri bukan ai yaa yg ngetik ok  fikri yg ngetik
            const response = await fetch("http://localhost:3001/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.role !== "Admin") {
                    alert("Akses ditolak! Anda bukan staff yang berwenang.");
                    router.push("/login-buyer");
                    return;
                }

                localStorage.setItem("token", data.token);
                localStorage.setItem("role", data.role);
                localStorage.setItem("username", username);

                alert("Welcome, Admin!");

                router.push("/admin-dashboard");
            } else{
                alert(`Akses Gagal Guyss: ${data.message || "Data salah"}`);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Gagal terhubung ke server keamanan Gess.");
        }
    }
}