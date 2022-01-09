import React, {useEffect, useRef, useState} from 'react';
import './assets/App.sass';

// типы данных
interface DataTipe {
    Error: string,
    Id: 0,
    Success: boolean,
    Value: {
        Goods: Array<{
            B: boolean,
            C: number,
            CV: null|any,
            G: number,
            P: number,
            Pl: null|any,
            T: number
        }>
    }
}

interface CategoryType {
    id: number,
    title: string,
    products: Array<ProductType>
}

interface ProductType {
    id: number,
    title: string,
    price: number,
    quantity: number,
    quantityCart?: number
}

interface PropsTable {
    title: string,
    products: Array<ProductType>,
    course: number,
    setCart: any
}

// Функции перемножения дробных чисел Без погрешности двоичной системы
function fractional_multiplication(a:number, b:number) {
    let parts_a = a.toString().split('.'); // Преобразовываем число к строке и разбиваем его по точке
    let a_lenth = 0 // Количество символов после запятой
    let new_a = Number.parseInt(parts_a.join("")) // Получили целое число без запятой
    let parts_b = b.toString().split('.'); // Преобразовываем число к строке и разбиваем его по точке
    let b_lenth = 0 // Количество символов после запятой
    let new_b = Number.parseInt(parts_b.join("")) // Получили целое число без запятой
    if(parts_a.length > 1){ // Проверяем числа на наличие дробной части
        a_lenth = parts_a[1].length // Указываем количество символов после запятой
    }
    if(parts_b.length > 1){ // Проверяем числа на наличие дробной части
        b_lenth = parts_b[1].length // Указываем количество символов после запятой
    }
    return Number.parseFloat(((new_a * new_b) / Math.pow(10, (a_lenth + b_lenth))).toFixed(2)) // Перемножаем целые числа после Делим на 10 в степени суммы количества знаков после запятой
}

// Функция получения рандомного числа в промежутке
function randomNumber(min:number, max:number){
    const r = Math.random()*(max-min) + min
    return Number.parseFloat((r).toFixed(2))
}

// Хук хранения предыдущего значение состоянии
function usePrevious(value:any) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

export default function App() {
  // Получаем значение товаров и групп
  let names = require('./data_in/names.json');

  // Определение состояний
  const [course, setCourse] = useState<number>(randomNumber(20.01, 79.99));
  const [data_products, setDataProducts] = useState<Array<CategoryType>>([{
      id: 0,
      title: '',
      products: []
  }]);
  const [cart, setCart] = useState<Array<ProductType>>([])
  const [table_now, setTableNow] = useState<PropsTable>({
      title: '',
      products: [],
      course: course,
      setCart: setCart,
  })

  // Запоминаем Инпут вода курсе
  const course_input = useRef<any>()

  // Функция получения данных из oпределение данных
  const GetData = () => {
      const data:DataTipe = require('./data_in/data.json');
      let data_products_now:Array<CategoryType> = []
      data.Value.Goods.map((item) => {
          const group = names[item.G.toString()]
          const prouct = group.B[item.T.toString()]
          if(data_products_now.find((item_group, index_group)=>{
              if(item_group.id === item.G){
                  if(item_group.products.find((prouct_item, index_prouct)=>{
                      if(prouct_item.id === item.T){
                          return true
                      }
                  }) === undefined){
                      data_products_now[index_group].products.push(
                          {
                              id: item.T,
                              title: prouct.N,
                              price: item.C,
                              quantity: item.P
                          }
                      )
                  }
                  return true
              }
          }) === undefined){
              data_products_now.push({
                  id: item.G,
                  title: group.G,
                  products: [
                      {
                          id: item.T,
                          title: prouct.N,
                          price: item.C,
                          quantity: item.P
                      }
                  ]
              })
          }
      })
      const course_input_new = randomNumber(20.01, 79.99)
      course_input.current.value = course_input_new
      setCourse(course_input_new)
      setDataProducts(data_products_now)
      if(table_now.title === '' && table_now.products.length === 0){
          setTableNow((prevState) => {
              prevState.title = data_products_now[0].title;
              prevState.products = data_products_now[0].products;
              prevState.course = course_input_new
              return {...prevState}
          })
      } else {
          setTableNow((prevState) => {
              prevState.course = course_input_new
              return {...prevState}
          })
      }
  }

  // Обновление данных и курса каждые 15 секунд
  useEffect(()=>{
    GetData()
    const timer = setInterval(GetData, 15000)
    return () => clearInterval(timer);
  }, []);

  // Эффект отслеживания курса
  useEffect(()=>{
      if(isNaN(course)){ // Если курс не число
          setCourse(0) // то равняется нулю
      }
  },[course])

  return (
      <div>
          <div className='header'>
              <div className='category'>
                  {
                      data_products.map((item)=>{
                          return (
                              <button className={table_now.title === item.title ? 'active' : ''} key={item.id} onClick={()=>{
                                  // @ts-ignore
                                  setTableNow((prevState) => {
                                      prevState.title = item.title;
                                      prevState.products = item.products;
                                      prevState.course = course
                                      return {...prevState}
                                  })
                              }}>{item.title}</button>
                          )
                      })
                  }
              </div>
              <div>
                  1$=
                  <input ref={course_input} type="number" step="0.01" defaultValue={course} onChange={(e)=>{setCourse(Number.parseFloat(e.target.value))}}/>₽
              </div>
          </div>
          <Table {...table_now} course={course}/>
          {cart.length > 0 ? <Cart cart={cart} setCart={setCart} course={course}/> : null}
      </div>
  )
}


// Функциональный компонент корзины
function Cart(props:{cart:Array<ProductType>, setCart:any, course:number}){
    const {cart, setCart, course} = props
    const [totalPrice, setTotalPrice] = useState<number>(0)
    useEffect(()=>{
        setTotalPrice(cart.reduce((summ: number, item) => {
            return summ + fractional_multiplication(fractional_multiplication(item.price, course), item.quantityCart ? item.quantityCart : 0)
        }, 0))
    },[cart, course])
    return(
        <div className="cart">
            <table cellSpacing="0">
                <thead>
                <tr>
                    <th>Наименование товара и описание</th>
                    <th>Цена</th>
                    <th>Количество</th>
                    <th>Стоимость</th>
                    <th/>
                </tr>
                </thead>
                <tbody>
                {
                    cart.map((item, index) => {
                        return(
                            <tr>
                                <td>{item.title}</td>
                                <td><ComparePrice price={fractional_multiplication(item.price, course)}/></td>
                                <td><input type="number" value={item.quantityCart} min={0} max={item.quantity} onChange={(e)=>setCart((prevState:any) => {
                                    const quantity = e.target.value
                                    if(prevState[index].quantity >= quantity){
                                        prevState[index].quantityCart = e.target.value
                                    } else {
                                        alert('В наличии есть только ' + item.quantity + 'шт.')
                                    }
                                    return [...prevState]
                                })}/></td>
                                <td><ComparePrice price={fractional_multiplication(fractional_multiplication(item.price, course), item.quantityCart ? item.quantityCart : 0)}/></td>
                                <td><button onClick={()=>setCart((prevState:any) => {
                                    prevState.splice(index,1)
                                    return [...prevState]
                                })}>Удалить</button></td>
                            </tr>
                        )
                    })
                }
                <tr>
                    <td colSpan={4} style={{textAlign: 'right'}}>Итого:</td>
                    <td style={{textAlign: 'right'}}><ComparePrice price={Number.parseFloat(totalPrice.toFixed(2))}/></td>
                </tr>
                </tbody>
            </table>
        </div>
    )
}

// Функциональный компонент отображение стоимости
function ComparePrice(props:{price:number}){
    const prevState = usePrevious(props.price) // Получаем предыдущее состояние цены
    const [color, setColor] = useState<string>('green')
    useEffect(()=>{
        if(prevState){
            if(prevState > props.price){
                setColor('green')
            } else {
                setColor('red')
            }
        }
    },[props.price])
    return <div style={{color: color, width: 'max-content'}}>{props.price} ₽</div> // Меняем цвет зависимости от изменения цены
}

// Функциональный компонент таблицы
function Table(props:PropsTable){
  const {products, course, setCart} = props;

  return(
      <table>
        <tbody>
        {
          products.map((product)=>{
              return(
                  <tr key={product.id}>
                      <td style={{width: "80%"}}>{product.title}({product.quantity})</td>
                      <td className="endTab">
                          <ComparePrice price={fractional_multiplication(product.price, course)}/>
                          <button onClick={()=>setCart((prevState:any)=> {
                          if(prevState.length > 0){
                              if(prevState.find((item_cart:ProductType, index_cart:number) => {
                                  if(item_cart.id === product.id){
                                      if(item_cart.quantityCart){
                                          if(item_cart.quantityCart < product.quantity){
                                              prevState[index_cart].quantityCart ++
                                          } else {
                                              alert('В наличии есть только ' + product.quantity + 'шт.')
                                          }
                                          return true
                                      }
                                  }
                              }) === undefined){
                                  product.quantityCart = 1
                                  prevState.push(product)
                              }
                          } else {
                              product.quantityCart = 1
                              prevState.push(product)
                          }
                          return [...prevState]
                      })}>Add Cart</button>
                      </td>
                  </tr>
              )
          })
        }
        </tbody>
      </table>
  )
}
