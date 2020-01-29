import PubSub from "pubsub-js";

// function useState(state) {
//   const proxy = new Proxy(
//     { state },
//     {
//       get(target, name) {
//         return name in target ? target[name] : undefined;
//       },
//       set(obj, prop, value) {
//         PubSub.publish("New value", value);
//         obj[prop] = value;
//         console.log(obj, prop, value);
//         return true;
//       }
//     }
//   );

//   function setter(value) {
//     proxy.state = value;
//   }

//   function getter() {
//     return proxy.state;
//   }

//   return [getter, setter];
// }

function useState(initial) {
  let state = initial;

  const setState = (value) => {
    state = value;
    PubSub.publish("New value", value);
  };

  const getter = () => {
    return state;
  };

  return [getter, setState];
}

function useEffect(callback, state) {
  const token = PubSub.subscribe("New value", callback);
}
const [state, setState] = useState(15);
useEffect(() => {
  console.log("State updated");
}, state);

setState(25);

class Component {
  constructor(props) {
    const self = this;
    const { state, template, root } = props;
    this.template = template;
    this.root = root;
    this.state = new Proxy(state, {
      get(obj, prop) {
        return prop in obj ? obj[prop] : undefined;
      },
      set(obj, prop, val) {
        obj[prop] = val;
        self.render(self.root);
        return true;
      }
    });
  }
  render(root) {
    const el = document.querySelector(root);
    el.innerHTML = this.template(this.state);
  }
}

class TodoList extends Component {
  constructor(tasks, template, root) {
    super({ state: tasks, template, root });
    this.render(root);
  }
  addTodo(todo) {
    this.state.push(todo);
  }
}

const todoList = new TodoList(
  ["Posprzątać", "Zmyć"],
  (todos) =>
    todos.reduce(
      (template, todo) => (template += `<li class="todo">${todo}</li>`),
      ""
    ),
  "#todos"
);

function addTodo() {
  const addTodoBtn = document.getElementById("addTodo");
  addTodoBtn.addEventListener("click", function() {
    todoList.addTodo("Wykąpać psa");
  });
}
addTodo();
