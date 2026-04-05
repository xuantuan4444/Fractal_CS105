"""
Fractal CS105 - Main Entry Point
=================================
Chuong trinh chinh de chay cac fractal khac nhau.
"""

import sys
import os


def print_banner():
    """In banner chao mung."""
    banner = """
    =====================================================
              FRACTAL CS105 - GENERATOR                 
              Do hoa may tinh - Fractal Project          
    =====================================================
    """
    print(banner)


def print_menu():
    """In menu lua chon."""
    menu = """
    -----------------------------------------------------
      CHON FRACTAL                                      
    -----------------------------------------------------
      1. Van Koch Snowflake (Animation - Matplotlib)    
      2. Minkowski Island (Animation - Matplotlib)      
      3. Mandelbrot & Julia Set                         
      4. Sierpinski Triangle                            
      0. Thoat                                          
    -----------------------------------------------------
    """
    print(menu)


def run_van_koch_snowflake():
    """Chay Van Koch Snowflake animation."""
    try:
        from Vankoch_Minkowski import Vankoch_Snowflake
        print("\nDang khoi chay Van Koch Snowflake Animation...")
        print("   (Animation se mo trong cua so moi)")
        Vankoch_Snowflake.animate_snowflake_evolution()
    except ImportError as e:
        print(f"Loi import: {e}")
        print("   Dam bao file Vankoch_Minkowski/Vankoch_Snowflake.py ton tai")
    except Exception as e:
        print(f"Loi: {e}")


def run_minkowski_island():
    """Chay Minkowski Island animation."""
    try:
        from Vankoch_Minkowski import Minkowski
        print("\nDang khoi chay Minkowski Island Animation...")
        print("   (Animation se mo trong cua so moi)")
        Minkowski.animate_minkowski_evolution()
    except ImportError as e:
        print(f"Loi import: {e}")
        print("   Dam bao file Vankoch_Minkowski/Minkowski.py ton tai")
    except Exception as e:
        print(f"Loi: {e}")


def run_mandelbrot_julia():
    """Chay Mandelbrot & Julia Set."""
    print("\nMandelbrot & Julia Set")
    print("   Luu y: Module nay chua duoc tich hop.")
    print("   TODO: Them code tu thu muc Mandelbrot_JuliaSet/")


def run_sierpinski():
    """Chay Sierpinski Triangle."""
    print("\nSierpinski Triangle")
    print("   Luu y: Module nay chua duoc tich hop.")
    print("   TODO: Them code tu thu muc Sierpinski_sierpinski/")


def main():
    """Ham chinh cua chuong trinh."""
    while True:
        print_banner()
        print_menu()
        
        try:
            choice = input("Nhap lua chon cua ban (0-4): ").strip()
            
            if choice == "0":
                print("\nCam on ban da su dung Fractal CS105!")
                sys.exit(0)
            elif choice == "1":
                run_van_koch_snowflake()
            elif choice == "2":
                run_minkowski_island()
            elif choice == "3":
                run_mandelbrot_julia()
            elif choice == "4":
                run_sierpinski()
            else:
                print("\nLua chon khong hop le. Vui long chon 0-4.")
            
            input("\nNhan Enter de tiep tuc...")
            print("\n" * 2)  # Clear screen effect
            
        except KeyboardInterrupt:
            print("\n\nDa huy boi nguoi dung. Tam biet!")
            sys.exit(0)
        except Exception as e:
            print(f"\nLoi khong mong muon: {e}")
            input("\nNhan Enter de tiep tuc...")


if __name__ == "__main__":
    main()