import chalk from "chalk";
import { Color } from "@/types/enums";

export const printTerminalMessage = (message: string, color?: Color) => {
  const _color = color || Color.WHITE;
  switch (_color) {
    case Color.RED:
      console.log(chalk.red(message));
      break;
    case Color.GREEN:
      console.log(chalk.green(message));
      break;
    case Color.YELLOW:
      console.log(chalk.yellow(message));
      break;
    case Color.BLUE:
      console.log(chalk.blue(message));
      break;
    case Color.MAGENTA:
      console.log(chalk.magenta(message));
      break;
    case Color.CYAN:
      console.log(chalk.cyan(message));
      break;
    case Color.WHITE:
      console.log(chalk.white(message));
      break;
    case Color.BLACK:
      console.log(chalk.black(message));
      break;
    default:
      console.log(chalk.white(message));
      break
  }
};
